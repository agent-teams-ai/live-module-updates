# Industry reuse register: precise lifecycle contracts for a standalone live-update library

Дата: **2026-11-23**. База: Extension Foundation **f285333c5869b1f69070efee29b205da8fd19e49**, прочитана без изменений. Статус: **source research и архитектурные предложения; 0 production LOC, 0 новых native execution в этой lane**. Q1–Q7 остаются OPEN.

Это дополнение к существующим обзорам, а не повторная оценка всего рынка. Оно уточняет несколько механизмов, от которых зависит честность будущих адаптеров: завершение lifecycle, владение поздней очисткой, sharing, двухфазная загрузка и фактическое применение новой версии. Файлы `findings.json` и `sources.json` содержат машиночитаемые выводы, exact URLs, release/commit cohorts, ограничения и доказательственный класс.

## 1. Главные изменения после предыдущего обзора

1. **Piral не обещает асинхронное завершение teardown:** публичный тип — `void`. Поэтому bridge может добавить собственное подтверждение завершения, но не должен выдавать его за существующую upstream гарантию. При этом `setup` допускает Promise, а runner обрабатывает его ошибку; fulfillment внешнего действия не доказывает полезную готовность кандидата. [P01], [P02], [P03], [P04]
2. **Late cleanup требует точной идентичности владельца.** Piral page disposer удаляет по route, extension disposer — по reference. OSGi отдельно описывает bind-new-before-unbind-old и опасность стирания нового сервиса старым unbind. Это конкретный контракт для contribution bridges, а не общее пожелание «корректно очищать». [P05], [P06], [P07], [O01]
3. **Повторное закрытие не всегда присоединяется к первой очистке.** Effect 4.1.5 прямо допускает возврат второго `Scope.close`, пока finalizers первого ещё выполняются. Resources 0.2.2 документирует один close flight и присоединение повторных callers. Абстракция обязана сохранить это различие. [E01], [G01]
4. **Сложную работу с разделяемыми ресурсами уже делает Effect.** Native MemoMap связывает observers, finalizers, acquisition outcome и interruption; public child MemoMap позволяет ограниченное повторное использование зависимостей. Копирование такой логики — явный кандидат на лишний собственный код. [E02], [E06]
5. **Настоящая atomic native load встречается, но имеет узкую область.** OTP даёт атомарную загрузку набора модулей и отдельно может отклонить finish после успешной подготовки. Это полезный образец для truthful profiles, не обещание тех же свойств для любого JS loader. [T01], [T02]

Оставшаяся работа новой библиотеки — согласовать готовые механизмы в одну поддержанную операцию и сохранить смысл их результатов. Это ещё не доказанный сравнительный выигрыш над готовыми стеками. Один bounded Piral bridge и один Effect discriminator проверяют конкретные seams; они не квалифицируют всю библиотеку.

## 2. Что здесь считается доказательством

| Класс | Что установлено | Чего он не устанавливает |
| --- | --- | --- |
| Exact source / declared type | Прочитанный контракт и выбранная ветвь pinned реализации | Поведение любого package build или иной конфигурации |
| Current registry metadata | Версии, entrypoints, dependencies, integrity на момент retrieval | Совместимость установленного графа и успешный запуск |
| Versioned specification | Нормативный контракт OSGi; VM-specific контракт OTP | Корректность неисполненного JS переноса |
| Retained native evidence | Предыдущие сохранённые MF 4/4, SystemJS 2/2 и их точные границы | Новый запуск, общая метрика качества или production certification |
| Proposed transfer | Инженерное следствие для профиля/контракта | Принятый public API, policy default либо выбор runtime |
| Proposed spike | Проверяемое утверждение и independent oracle | Уже полученный PASS |

Current metadata повторно проверена 23 ноября: Piral family **1.12.5**, MF runtime **2.9.3**, Native Federation core **4.10.1** / orchestrator **4.10.2**, OC **0.50.67**, OC browser **2.1.13**, OC Node client **4.0.4**, Effect **4.1.5**. Exact receipts находятся в `sources.json`.

Критичные несовпадения cohorts сохранены:

- NF source manifest в прочитанном orchestrator commit — **4.10.0**; published 4.10.2 не объявлен byte-equivalent.
- OC Node client 4.0.4 зависит от browser **1.5.4**. Выводы из browser2.1.13 не распространяются на этот путь.
- Effect4.1.5 — новая исследованная версия; принятый GM Effect peer4.1.4 этим отчётом не обновляется.
- GM current main **850bac5fd02fa5697846cc8958ac447d5c2ee7bb** и опубликованный Resources0.2.2 имеют отдельные source/package identities.
- React18/router5 — предложенный профиль Piral fixture. `piral-core` не объявляет такой peer floor; нельзя превращать dependencies umbrella package в выдуманный peer contract.

## 3. Piral: полезный готовый lifecycle, которому нужен честный bridge

### 3.1. Готовность кандидата

Публичный путь существует без private imports: `createInstance`, реальный `Piral` root, `instance.context.addPilet/removePilet/readState`, configurable `loadPilet` и реальные registration APIs. Это достаточная поверхность, чтобы наблюдать route с работающей кнопкой A/B, состояние managed registry и независимый native listener. Не требуется писать собственный shell, event bus или fake registry. [P08], [P09], [P10], [P11], [P14]

В inspected same-name пути сначала меняется набор pilets и убираются прежние managed contributions, затем выполняется новый setup. Runner может залогировать failure; отдельный action Promise не заменяет прикладную readiness receipt. Для replacement с сохранением полезного A это существенное ограничение выбранного seam. [P02], [P03]

**Что переносить:** независимый результат setup/readiness с привязкой к точному candidate instance; наблюдение действительно полезного UI. Если framework уже разрушил A, bridge сообщает этот факт. Очистить провалившийся B полезно, но это не восстанавливает A автоматически.

**Когда исходное поведение уместно:** shell продолжает работу при проблеме отдельной contribution; немедленная замена допускается продуктом. Такой profile может быть полезен, даже если не поддерживает недеструктивное prepare-before-publish.

**Что не копировать:** catch/log как наш универсальный success contract; обещание transaction из последовательности add/remove. Нельзя объявить весь Piral непригодным: исследуется один public replacement путь, а расширения и альтернативные интеграции требуют своих доказательств.

### 3.2. Асинхронная работа и позднее удаление регистрации

`SinglePiletApp.setup` имеет тип `void | Promise<void>`, `teardown` — `void` (точные anchors 76/81 в source ledger). Асинхронная работа, запущенная из teardown, может продолжаться, но upstream не обещает ожидать её завершения. JavaScript допускает такой callback; из этого не появляется дополнительный lifecycle contract. [P01]

Page disposer вызывает unregister по route. В реализации удаления page нет проверки старого object/generation; extension disposer передаёт reference, который участвует в predicate удаления. Отсюда source-predicted контрпример: A сохранил page disposer, B зарегистрировал тот же route, поздний disposer A убирает B. Distinct extension reference даёт содержательный положительный контроль. Это ещё не результат нового native запуска. [P05], [P06], [P07]

Правильная граница bounded bridge: **Piral-managed registration cleanup остаётся синхронным; асинхронные native resources принадлежат точному Resources scope**. Bridge не обещает прозрачно исправить arbitrary foreign pilet, который поздно вызывает generation-unaware unregister. Для такого кода требуется другой поддержанный seam либо более слабая гарантия.

### 3.3. Build integration — тоже готовый механизм

Public core использует настоящий `app.codegen`; он вызывает поставляемый генератор defaults/router/dependencies. Official `piral-cli-vite8` использует `vite-plugin-codegen`. Для fixture найден опубликованный **2.1.0**, с root ESM/CJS/declarations и без runtime dependencies в metadata. Это конкретная возможность переиспользования вместо handwritten generated-state shim. [P12], [P13], [P16], [P17]

Source signature plugin независимо проверяет CI lane. Эта lane не запускала compiler/build. В native qualification должны войти generated output, exact installed graph и все compiler instances. До динамических добавлений fixture ждёт public initial-loading completion: реальный startup Mediator иначе ещё может выполнять initial initialization. [P15]

## 4. Cleanup: состояние scope, завершение flight и физический ресурс

| Механизм | Публичная наблюдаемая семантика | Следствие для адаптера |
| --- | --- | --- |
| Effect4.1.5 `Scope.close` | Второй вызов уже закрытого scope может немедленно завершиться во время finalizers первого | Сохранять original closing fiber/effect outcome; второй вызов не заменяет join |
| Resources0.2.2 `close` | Один close flight; повторный caller присоединяется; failed cleanup сохраняется debt и может быть повторён | Переиспользовать действующий owner/CloseReport, не создавать рядом свой close manager |
| Resources abandon | Прекращает ожидание этого caller, flight продолжается | Interrupted wait не превращается в released resource |
| Callback completion | Код cleanup завершился по контракту конкретного owner | Physical listener/socket/process state требует соответствующей независимой observation |

Это не ranking библиотек. Effect оптимизирует свой native scope lifecycle; Resources предлагает другой cooperative cleanup contract. Универсальный метод `close(): boolean` потеряет существенный результат в обоих случаях. [E01], [G01]

В Effect `closeUnsafe` дополнительно явно требует выполнить возвращённый finalizer effect; игнорирование его или некорректная interruptibility может оставить незавершённую очистку после уже установленного closed state. Для нашего bridge нужен public safe API, а не копия внутреннего алгоритма. [E01]

Для Resources retry также нельзя обещать магический откат частичных действий callback. Повторная очистка работает в рамках фактической native ownership; callback может выполнить часть действий перед ошибкой. Report должен сохранить исходную причину, оставшуюся debt и наблюдение следующей попытки. Scope finalizer, ожидающий close того же/ancestor scope, создаёт недопустимую зависимость ожидания — интеграция должна уважать документированный lifecycle owner. [G01]

**Предложенный discriminator E1:** реальный EventTarget listener; finalizer сообщает entered и ждёт release. Первый close работает в отдельном native fiber. После entered второй close завершается, а listener ещё отвечает. Затем release и join первого close; listener больше не отвечает. Это различает state-idempotency и завершение реального эффекта без private polling и фиксированных sleeps. Рецепт использует public Scope/Deferred/Effect/Fiber; при failed assertion release всё равно открывается, чтобы не strand uninterruptible finalizer. [E01], [E03], [E04], [E05]

## 5. Shared dependencies: не писать заново acquisition/refcount engine

Current Effect4.1.5 MemoMap интересен не только кешированием. Inspected source:

- привязывает entry к **Layer object identity**;
- связывает observer registration и cleanup accounting;
- устанавливает exit observer **до публикации** новой shared entry, чтобы завершить ожидающий Deferred и при interruption первоначального requester;
- предоставляет public `forkMemoMap(parent)` и `buildWithMemoMap` для явного reuse/scope. [E02]

Это высокая сложность, уже решаемая существующим native mechanism. Для optional Effect profile разумно переиспользовать его public surface и сохранять требования/error/interruption semantics. Не следует копировать внутренний Map/refcount или сводить native construction к произвольному Promise cache.

Public child MemoMap может переиспользовать имеющиеся parent entries, а новые allocations держать в child. Это кандидат для bounded stable-dependency reuse при подготовке новой generation. Он **не решает** semantic compatibility данных и сервисов: одинаковая версия исходника не равна одинаковому Layer object; общий объект не доказывает, что выбранный application cohort безопасен. [E02], [E06]

История важна именно как предупреждение о цене собственного concurrency кода. Upstream September recap сообщает об исправленных interruption-related cleanup/Layer проблемах. Current source содержит concrete protections; отчёт не выдаёт исторический fixed issue за текущую ошибку и не утверждает воспроизведённый affected release. [E07]

Аналогичная граница у MF: existing share resolver нужен в том числе для identity-sensitive contracts, а не только для экономии bundle. Сохранённые 4/4 показывают выбранные old/new references, evaluation и shared-scope/container boundaries. Эти результаты не превращают новый MF instance в новый realm, а удаление loader record — в physical unload. Квалификацию надо привязывать к конкретной loader/sharing конфигурации. [B05]

## 6. Зрелые схемы: переносить конкретную гарантию

### OSGi: identity-aware unbind и отдельная политика выбора

OSGi DS112.5.12 описывает dynamic unary rebind: bind нового service предшествует unbind старого. Спецификация специально предупреждает, что старый unbind не должен стирать новую привязку. Это прямой промышленный образец для delayed contribution cleanup: старый владелец меняет выбранную ссылку только если она ещё принадлежит ему. [O01]

Гарантия относится к определённой reference; не следует расширять её до atomic замены всего dependency cohort. GREEDY/RELUCTANT отдельно определяют реакцию на более подходящего провайдера. Полезно разделить «новый доступен» и «выбран политикой», но OSGi defaults не становятся нашими defaults. [O02]

### OTP: реальная atomic code load и backpressure

Проверен OTP29.1.2, commit **d199a49a01a2079afb6f2c5c9ae047cd4555e68d**. `atomic_load` и prepare/finish loading предоставляют реальную native границу для набора модулей с явными ограничениями. Подготовка отвергает, например, неподдерживаемые для этого пути on_load modules; finish может встретить runtime condition, которой не было при prepare. [T01], [T02]

Переносимый принцип: **prepared не означает неизбежно publishable**. Последняя authority/runtime проверка сохраняется. Если backend даёт более сильную atomic module-load boundary, adapter должен использовать её; общий TS слой не может пообещать её для ESM/MF.

`soft_purge` отказывается освобождать код при обнаруженных VM lingering references. Это полезная bounded backpressure модель, но определение ссылок принадлежит VM; она не учитывает все внешние effects, state history или старые клиенты с lazy assets. Принудительное завершение, бюджеты удержания и fallback остаются решениями владельца. [T01]

### Native Federation: не терять уже существующий rollback

Inspected orchestrator поддерживает staged repository rollback; это реальная положительная возможность. При этом dynamic init аддитивен к committed mappings и не означает замену известного remote. Отдельный async import-map acknowledgment не равен repository commit. [N01], [N02], [N03]

Наша запись результата должна указывать, **что именно** committed/rolled back и каким owner. Нельзя назвать cache rollback восстановлением UI, canonical data и host effects. Нельзя также утверждать, что у NF вообще нет transactional machinery: inspected source опровергает такую оценку.

Current core metadata требует TypeScript `>=5.0.0 <7`; это конкретный compatibility gate для затронутого tooling при нашем TS7 floor. Это не доказательство невозможности любого runtime-only NF профиля. Ни такой обходной профиль, ни dependency override здесь не принимается.

## 7. UI lifetime и видимый результат

OC browser2.1.13 откладывает cleanup после disconnect и проверяет, не был ли element снова подключён. Это полезная защита от трактовки DOM move как окончательного destroy. Selected managed ESM path вызывает unmount; arbitrary returned Promise не становится автоматически awaited cleanup contract. Другая версия browser либо template требует собственной проверки. [C01]

Библиотеке нужны раздельные факты: contribution mounted, полезное действие доступно, выбранная generation, state continuity и resource completion. Их проекция позволяет показать «новая версия выбрана, эта вкладка ещё использует предыдущую» без выдуманного глобального успеха или failure.

Zephyr уже предоставляет существенные delivery/version/rollback mechanisms; Electron OTA описан как Beta. Полезный transfer — показывать actual adoption и требуемое действие пользователя отдельно от deployment pointer. Возврат environment release не доказывает восстановление произвольного dirty state или компенсацию external effects. Готовые стеки являются сильными решениями части сценария; сравнивать их с будущими обещаниями нашей библиотеки нечестно. [D01], [D02], [B02]

Предыдущие editor/retention исследования остаются базой: dirty document, undo/selection, операции, artifacts и old clients имеют разных owners. Новые lifecycle факты не устраняют эти ограничения. В текущей lane нет нового editor E2E или доказанного сохранения state для Piral/OC.

## 8. Конкретные обязательства профиля — без нового universal SPI

Ниже семантические вопросы для дизайна и conformance, а не согласованные method names.

| Обязательство профиля | Проверяемое содержание | Где брать механизм |
| --- | --- | --- |
| Identity / build closure | Exact source/package/runtime/framework/compiler; shared-contract и realm assumptions | Existing package/build/delivery tooling |
| Preparation effects | Какие imports/init/setup выполняются; что уже видно и что остаётся owned при failure | Реальный loader + execution/resource owner |
| Readiness | Что ack доказывает, кто его выдаёт, к какому instance относится | Framework/product useful contract, observed отдельно |
| Publication | Expected predecessor, canonical attempt outcome, conflict/unknown | Consumer authority primitives; operation в библиотеке |
| Binding ownership | Может ли старый disposer изменить текущую registration и как проверяется identity | Actual registration API; unsupported path явно ограничен |
| Admitted work | Cohort affinity, late acquisition и continuation ownership | Квалифицированный существующий admission/custody mechanism |
| Cleanup completion | Requested, original flight, joined outcome, debt и physical observation | Native scopes/resources/executor |
| Retention | Runtime work, state/history, assets и old clients имеют отдельные holds | Их существующие owners и выбранная policy |
| UI adoption | Какая contribution реально стала полезной и какие state guarantees поддержаны | Framework-specific observation |
| Recovery | Same-attempt reconciliation, сохранённый uncertain outcome, допустимый fallback | Готовая операция библиотеки над primitive owner contracts |

Public Resources не предоставляет atomic call+custody admission. Частный lifecycle kernel нельзя копировать/deep-import, а отсутствующий механизм нельзя переложить в каждого consumer. Его публичная qualification решается у owning repository; слабый stateless/disruptive profile может не требовать всех guarantees, но обязан честно ограничить результат. [G01], [G02], [B01], [B03]

Library-owned attempt record допустим как процессное состояние наблюдений. Он не должен становиться вторым independently advancing active-generation registry. Принятое направление остаётся прежним: **одна готовая операция в standalone library; consumer даёт narrow authority/grants/canonical-state primitives**. [B01], [B02]

## 9. Приоритетные спайки и пределы вывода

Подробный brief: `SPIKE-BRIEF.md`. Конкретный изменяемый план и freeze принадлежат CI/root lane.

| Кампания | Что действительно различает | Чего не доказывает |
| --- | --- | --- |
| Piral raw: P1/P2 | Реальная полезная A/B page, rejected setup/action outcome, route-only late disposer и reference-positive control | Универсальную непригодность Piral или Promise-contract bug |
| Piral + public Resources: B1/B2/B3 | Явная candidate readiness, cleanup failure/debt, exact-instance retry; B остаётся полезным после cleanup A | Недеструктивный prepare, автоматический rollback, generic foreign-pilet adaptation, admission kernel |
| Effect E1 | Повторный close может завершиться до original finalization; listener подтверждает физический эффект | Все правила cancellation/Layer/recovery или production integration |

План ограничен **двумя Piral browser tests с пятью именованными cases** и одним bounded Effect Node discriminator. Это число планируемых tests; receipt rows и повторные запуски не увеличивают coverage. Production LOC — **0**; будущие fixture LOC учитываются отдельно CI lane. Все maintained TS/TSX обязаны пройти эффективный strict TypeScript>=7.0.2, без older embedded compiler и без declaration shims. [Q01]

**Что надо решить после результатов, а не сейчас:** какой готовый replacement seam соответствует выбранной первой гарантии; допустим ли disruptive profile; где требуется точный custody механизм; какие recovery/retention/UI policies нужны первому реальному consumer. Q1–Q7 остаются OPEN. Этот отчёт не выбирает runtime, rollout default, публичный API и не утверждает отсутствие будущего рефакторинга.

## 10. Confidence и оставшиеся пробелы

- **9–10/10:** прочитанные конкретные return types, identity predicates, Effect repeated-close contract и existing reuse APIs. Это уверенность в source interpretation, не статистика надёжности системы.
- **8–9/10:** предложенные seams и obligations; они согласуются с источниками и предыдущими доказательствами, но ещё требуют installed/native integration.
- **Не оценено как доказанный результат:** comparative advantage, production reliability, universal state preservation, migration safety и равенство гарантий разных execution profiles.

Самый содержательный отрицательный результат спайка тоже полезен: если thin public bridge не может сохранить полезный A или квалифицировать точное ownership, это определяет ограничение профиля. Не нужно исправлять oracle новым hidden manager, fake loader или private import. Следующий дизайн выбирается по наблюдаемой границе и открытому решению владельца.

## Source references

[P01]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-base/src/types/runtime.ts "Piral declared lifecycle return contracts"
[P02]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/actions/app.ts "Piral selection and injection order"
[P03]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-base/src/lifecycle/setup.ts "Piral setup rejection handling"
[P04]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-base/src/lifecycle/cleanup.ts "Piral cleanup actions"
[P05]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/modules/core.ts "Piral registration disposers"
[P06]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/actions/components.ts "Piral registration actions"
[P07]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/utils/state.ts "Piral deletion predicates"
[P08]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/index.tsx "Piral public root exports"
[P09]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/createInstance.tsx "Piral public instance creation"
[P10]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/types/config.ts "Piral public configuration"
[P11]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/types/state.ts "Piral public action/state observation"
[P12]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/app.codegen "Piral published codegen entry"
[P13]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/tools/codegen.ts "Piral generation implementation"
[P14]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/Piral.tsx "Piral root renderer"
[P15]: https://github.com/smapiot/piral/blob/15af4fd41e049b5880916af81e130cf22e6ac44b/src/framework/piral-core/src/components/Mediator.tsx "Piral initial loading barrier"
[E01]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Scope.ts "Effect Scope completion contract"
[E02]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Layer.ts "Effect Layer MemoMap and child reuse"
[E03]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Effect.ts "Effect public fiber scheduling"
[E04]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Deferred.ts "Effect public gates"
[E05]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Fiber.ts "Effect public completion observation"
[E06]: https://effect.website/docs/v4/requirements-management/layer-memoization "Effect layer memoization guide"
[E07]: https://effect.website/blog/effect-v4-rc-september-recap "Effect September concurrency correction history"
[G01]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/README.md "Public Resources ownership and completion"
[G02]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/src/index.ts "Public Resources exports"
[O01]: https://docs.osgi.org/specification/osgi.cmpn/8.1.0/service.component.html "OSGi dynamic reference replacement ordering"
[O02]: https://docs.osgi.org/javadoc/osgi.cmpn/8.1.0/org/osgi/service/component/annotations/ReferencePolicyOption.html "OSGi reference selection policy"
[T01]: https://github.com/erlang/otp/blob/d199a49a01a2079afb6f2c5c9ae047cd4555e68d/lib/kernel/src/code.erl "OTP atomic module loading and retirement boundary"
[T02]: https://www.erlang.org/doc/apps/kernel/code.html "OTP current documentation cohort"
[N01]: https://github.com/native-federation/orchestrator/blob/d1502d3b99e1164c79c0946296caad2cd9ee8068/docs/version-resolver.md "Native Federation committed mapping policy"
[N02]: https://github.com/native-federation/orchestrator/blob/d1502d3b99e1164c79c0946296caad2cd9ee8068/src/lib/core/2.app/steps/rollback-changes.ts "Native Federation staged rollback"
[N03]: https://github.com/native-federation/orchestrator/blob/d1502d3b99e1164c79c0946296caad2cd9ee8068/src/lib/core/2.app/steps/commit-changes.ts "Native Federation map acknowledgment"
[C01]: https://github.com/opencomponents/oc/blob/806b6a08d16d583a75dcdc5adb3266076e615dfd/packages/oc-client-browser/src/oc-client.js "OpenComponents browser lifecycle"
[D01]: https://docs.zephyr-cloud.io/features/instant-rollbacks "Zephyr rollback and actual client adoption"
[D02]: https://docs.zephyr-cloud.io/features/electron-ota-updates "Zephyr renderer update profile"
[Q01]: https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/engineering-quality-standard.md "Engineering Quality Standard"
[B01]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/architecture/live-extension-system-map.md "Current system map"
[B02]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/live-update-ready-stack-comparison-2026-11-23.md "Current ready-stack comparison"
[B03]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/live-update-reliability-and-industry-evidence-2026-11-22.md "Existing reliability and Resources qualification"
[B04]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/live-plugin-evolution-final-research-and-architecture-2026-11-17.md "Earlier mature runtime contracts"
[B05]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/module-federation-update-boundaries-and-architecture-options-2026-11-22.md "Prior MF and SystemJS native evidence"
[P16]: https://registry.npmjs.org/piral-cli-vite8/1.0.0 "piral-cli-vite8 published metadata"
[P17]: https://registry.npmjs.org/vite-plugin-codegen/2.1.0 "vite-plugin-codegen published metadata"

