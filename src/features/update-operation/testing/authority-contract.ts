import type { CandidateDescription, Head } from "../application/models.ts";
import type { UpdateAuthority } from "../application/ports/authority.ts";
import { authorityLaws } from "./authority-laws.ts";

export type AuthorityLawName =
  | "detached-read"
  | "canonical-publication"
  | "original-payload"
  | "stale-head"
  | "stale-basis"
  | "pending-original"
  | "lost-acknowledgement"
  | "immutable-receipt";

/**
 * A fresh disposable integration of the actual authority, not a supplied answer.
 * The two candidates are valid for this Host and distinct from its initial head.
 * Controls affect the next real publication. A hold lets publish and lookup
 * return unknown before release; it does not leave the publication call hung.
 * releasePublication settles held originals even after a failed assertion and
 * is safe with no hold or when called again. dispose retains/settles actual
 * native owners even if release fails. No control may fabricate a receipt.
 */
export interface AuthorityContractFixture {
  readonly authority: UpdateAuthority;
  readonly candidate: CandidateDescription;
  readonly successor: CandidateDescription;
  /** Read the actual native routing/effect state independently of authority.read. */
  readonly observeHead: () => Head;
  /** Change a real basis condition, keeping the head and fresh-basis candidate admissibility. */
  readonly invalidateBasis: () => void;
  readonly holdPublication: () => void;
  readonly loseAcknowledgement: () => void;
  readonly releasePublication: () => void | PromiseLike<void>;
  readonly dispose: () => void | PromiseLike<void>;
}

export interface AuthorityContractCase {
  readonly name: AuthorityLawName;
  readonly run: () => Promise<void>;
}

export type AuthorityContractFactory = (name: AuthorityLawName) =>
  AuthorityContractFixture | PromiseLike<AuthorityContractFixture>;

/** Preserve both the original law failure and every failed teardown operation. */
async function execute(factory: AuthorityContractFactory, name: AuthorityLawName,
  law: (fixture: AuthorityContractFixture) => Promise<void>): Promise<void> {
  const fixture = await factory(name);
  const failures: unknown[] = [];
  try { await law(fixture); } catch (cause) { failures.push(cause); }
  try { await fixture.releasePublication(); } catch (cause) { failures.push(cause); }
  try { await fixture.dispose(); } catch (cause) { failures.push(cause); }
  if (failures.length === 1) { throw failures[0]; }
  if (failures.length > 1) { throw new AggregateError(failures, "Authority law and/or native teardown failed"); }
}

/**
 * Runner-neutral executable laws for this finite authority profile. Each run
 * owns a new fixture and its teardown. The caller's registrar remains the runner.
 * Passing cases does not certify isolation, durability or product admission.
 */
export function authorityContractCases(create: AuthorityContractFactory): readonly AuthorityContractCase[] {
  return Object.freeze(authorityLaws.map(({ name, run }) => Object.freeze({
    name, run: () => execute(create, name, run),
  })));
}
