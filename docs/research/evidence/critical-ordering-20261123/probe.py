"""Research-only: bounded local admission schedule model + SQLite authority witness.
Not the library, Get Modular runtime, PostgreSQL, or production qualification.
"""
import itertools
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path


def schedules(update, caller):
    events = update + caller
    for order in itertools.permutations(events):
        if all(order.index(a) < order.index(b) for seq in (update, caller)
               for a, b in zip(seq, seq[1:])):
            yield order


def schedule_case(update, caller):
    outcomes = []
    for order in schedules(update, caller):
        phase = {'A': 'active', 'B': 'staged'}
        route, selected, outcome = 'A', None, None
        for event in order:
            if event in ('activate', 'switch'):
                phase['B'] = 'active'
            if event in ('route', 'switch'):
                route = 'B'
            if event in ('quiesce', 'switch'):
                phase['A'] = 'quiescing'
            if event in ('read', 'acquire'):
                selected = route
            if event in ('admit', 'acquire'):
                outcome = f'admitted-{selected}' if phase[selected] == 'active' else 'denied'
        outcomes.append({'schedule': list(order), 'outcome': outcome})
    failures = [x for x in outcomes if x['outcome'] == 'denied']
    return {'total': len(outcomes), 'denied': len(failures),
            'first_denial': failures[0] if failures else None, 'schedules': outcomes}


def db(path):
    con = sqlite3.connect(path, isolation_level=None)
    con.execute('PRAGMA synchronous=FULL')
    return con


def initialize(path):
    with db(path) as c:
        c.executescript('''
          CREATE TABLE head (id INTEGER PRIMARY KEY, epoch INTEGER, digest TEXT);
          INSERT INTO head VALUES (1, 0, 'A');
          CREATE TABLE receipt (attempt TEXT PRIMARY KEY, intent TEXT NOT NULL,
                                committed_epoch INTEGER, digest TEXT);
          CREATE TABLE writes (label TEXT PRIMARY KEY);
        ''')


def head(c):
    return list(c.execute('SELECT epoch, digest FROM head WHERE id=1').fetchone())


def publish(path, attempt, expected, target, keep_receipt=True):
    intent = json.dumps([expected, target], separators=(',', ':'))
    with db(path) as c:
        c.execute('BEGIN IMMEDIATE')
        found = c.execute('SELECT intent, committed_epoch, digest FROM receipt WHERE attempt=?', (attempt,)).fetchone()
        if found is not None:
            c.execute('ROLLBACK')
            return ['replay', found[1], found[2]] if found[0] == intent else ['intent-mismatch']
        changed = c.execute('UPDATE head SET epoch=epoch+1,digest=? WHERE id=1 AND epoch=?', (target, expected)).rowcount
        if changed != 1:
            c.execute('ROLLBACK')
            return ['conflict']
        now = head(c)
        if keep_receipt:
            c.execute('INSERT INTO receipt VALUES (?,?,?,?)', (attempt, intent, *now))
        c.execute('COMMIT')
        return ['committed', *now]


def lost_reply(path, keep_receipt, target='B'):
    p = subprocess.run([sys.executable, __file__, 'child', str(path),
                        '1' if keep_receipt else '0', target], capture_output=True, text=True)
    assert p.returncode == 73 and p.stdout == '' and p.stderr == '', (p.returncode, p.stdout, p.stderr)
    return {'exit_code': p.returncode, 'stdout': p.stdout, 'stderr': p.stderr}


def main():
    model = {
        'separate_activation_route_quiesce': schedule_case(('activate','route','quiesce'), ('read','admit')),
        'separate_activation_quiesce_route': schedule_case(('activate','quiesce','route'), ('read','admit')),
        'atomic_switch_split_acquire': schedule_case(('switch',), ('read','admit')),
        'atomic_switch_atomic_acquire': schedule_case(('switch',), ('acquire',)),
    }
    assert all(model[k]['denied'] > 0 for k in list(model)[:3])
    assert model['atomic_switch_atomic_acquire']['total'] == 2
    assert model['atomic_switch_atomic_acquire']['denied'] == 0
    with tempfile.TemporaryDirectory() as tmp:
        strong, weak, other = [Path(tmp) / f'{n}.db' for n in ('strong','weak','other')]
        for p in (strong, weak, other):
            initialize(p)
        child = lost_reply(strong, True)
        with db(strong) as c:
            after_crash = head(c)
        assert after_crash == [1, 'B']
        assert publish(strong, 'return-to-A', 1, 'A') == ['committed', 2, 'A']
        replay = publish(strong, 'original', 0, 'B')
        mismatch = publish(strong, 'original', 0, 'C')
        with db(strong) as c:
            after_retry = head(c)
            receipt_count = c.execute('SELECT count(*) FROM receipt').fetchone()[0]
        assert replay == ['replay', 1, 'B'] and mismatch == ['intent-mismatch']
        assert after_retry == [2, 'A'] and receipt_count == 2

        weak_child = lost_reply(weak, False)
        assert publish(weak, 'return-to-A', 1, 'A', False) == ['committed', 2, 'A']
        assert publish(other, 'unrelated', 0, 'C', False) == ['committed', 1, 'C']
        assert publish(other, 'return-to-A', 1, 'A', False) == ['committed', 2, 'A']
        with db(weak) as c, db(other) as d:
            weak_final, other_final = head(c), head(d)
            weak_receipts, other_receipts = [x.execute('SELECT count(*) FROM receipt').fetchone()[0] for x in (c,d)]
            assert weak_final == other_final == [2, 'A'] and weak_receipts == other_receipts == 0
            epoch_rejected = c.execute("UPDATE head SET epoch=epoch+1,digest='D' WHERE id=1 AND epoch=0").rowcount
            digest_accepted = c.execute("UPDATE head SET epoch=epoch+1,digest='D' WHERE id=1 AND digest='A'").rowcount
            assert epoch_rejected == 0 and digest_accepted == 1 and head(c) == [3,'D']
        with db(strong) as old:
            read_before_switch = head(old)
            assert read_before_switch == [2, 'A']
            assert publish(strong, 'switch-after-precheck', 2, 'E') == ['committed', 3, 'E']
            unfenced = old.execute("INSERT INTO writes VALUES ('stale-unfenced')").rowcount
            fenced = old.execute("INSERT INTO writes SELECT 'stale-fenced' FROM head WHERE id=1 AND epoch=?", (read_before_switch[0],)).rowcount
            current = old.execute("INSERT INTO writes SELECT 'current-fenced' FROM head WHERE id=1 AND epoch=3").rowcount
            assert (unfenced, fenced, current) == (1, 0, 1)
        result = {
            'scope': 'finite ordering model and real SQLite transactions; no product/GM/PG runtime execution',
            'python': sys.version, 'sqlite': sqlite3.sqlite_version,
            'schedule_model': model,
            'sqlite_cases': {
                'commit_before_lost_reply': {'child': child, 'observed_head': after_crash},
                'same_attempt_after_successor': {'receipt': replay, 'current_head': after_retry, 'receipt_count': receipt_count, 'mismatched_intent': mismatch},
                'head_only_ambiguity': {'lost_reply': weak_child, 'original_committed_history': ['A','B','A'], 'unrelated_history': ['A','C','A'], 'identical_final_heads': [weak_final, other_final], 'receipt_counts': [weak_receipts, other_receipts]},
                'aba': {'epoch_guard_changed': epoch_rejected, 'digest_guard_changed': digest_accepted},
                'receiver_fence': {'prechecked_epoch': read_before_switch[0], 'current_epoch': 3, 'stale_unfenced_rows': unfenced, 'stale_fenced_rows': fenced, 'current_fenced_rows': current},
            },
        }
        print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'child':
        outcome = publish(Path(sys.argv[2]), 'original', 0, sys.argv[4], sys.argv[3] == '1')
        assert outcome == ['committed', 1, sys.argv[4]]
        os._exit(73)  # commit completed; no response emitted
    main()
