---
title: "How to Show That a Vault Loader Extract Is an Accurate and Complete Copy of Vault Records for an Inspector"
route: "/insights/how-to-show-that-a-vault-loader-extract-is-an-accurate-and-complete-copy-of"
canonical: "https://rohithkspersonal.github.io/insights/how-to-show-that-a-vault-loader-extract-is-an-accurate-and-complete-copy-of"
description: "A Vault Loader extract is only as complete as its extract type, batch limits, indexing state and the extracting user's access. Prove completeness by…"
seoTitle: "Vault Loader Extract: Proving Complete Record Copies"
publicationId: "PUB-LIB-9002-r1-v10"
itemId: "LIB-9002"
contentRevision: 1
render: "navata-test-site@1"
---
# How to Show That a Vault Loader Extract Is an Accurate and Complete Copy of Vault Records for an Inspector

You show it by reconciliation, not by assertion. Vault Loader will produce a file, but Veeva documents limits and conditions that mean a file is not automatically a complete copy: each extract type has its own limit, newly created records may be missing while reindexing is in progress, and Loader returns only data the extracting user can access. Define the scope, take an independent count, run the extract, reconcile row counts and identifiers against that count, repeat after any batching, and keep a record of the whole exercise. Veeva does not state that an extract satisfies any regulatory requirement for copies; that conclusion is the customer's, and is Navata interpretation based on the sources below.

## What the regulation asks for

21 CFR 11.10(b) requires, for closed systems, the ability to generate accurate and complete copies of records in both human readable and electronic form, suitable for inspection, review and copying by the agency ([21 CFR 11.10](https://www.law.cornell.edu/cfr/text/21/11.10)). The same section requires secure, computer-generated, time-stamped audit trails that are retained as long as the related records and are available to the agency. The MHRA inspectorate has said that scanned copies should be fully readable and complete, that for electronic documents the associated metadata must be considered so that it is retained, and that copying processes must be validated ([MHRA Inspectorate blog](https://mhrainspectorate.blog.gov.uk/2016/12/14/2016-mhra-laboratories-symposium-your-questions)). That blog is a Q&A on laboratory records, not a statement of Vault requirements, so treat it as indicative of inspector expectations.

Neither source says that a Vault Loader extract meets these expectations. That is for you to demonstrate.

## What Vault documents about extract limits and completeness

Veeva's help page on extracting metadata and files lists a limit per extract type ([Veeva: extracting with Vault Loader](https://platform.veevavault.help/en/gr/31536)):

| Extract type | Output | Limit |
|---|---|---|
| Document/Document Version Metadata | CSV | 1,000,000 |
| Document/Document Version Source Files | CSV with links to file staging | 10,000 |
| Document/Document Version Renditions | CSV with links to file staging | 2,000 |
| Document/Document Relationships | CSV | 1,000,000 |
| Object Record Metadata | CSV | 1,000,000 |
| Object Relationships | CSV | 10 |
| Users | CSV | 1,000,000 |
| Groups | CSV | 1,000,000 |

Other documented conditions that affect completeness:

- **Reindexing.** The page states that while reindexing is in progress, newly created documents or object records may not be included in your extract, and that Vault extracts depend on indexed metadata. It describes reindexing as usually taking under one minute.
- **Query size.** Loader can hit a query-size limit of 50,000 characters; the page advises including fewer fields.
- **Files go to staging.** Source files, renditions and text files are written to the file staging area, not into the CSV. A related Veeva page says files and folders are deleted automatically after 72 hours by default ([Veeva: Vault Loader overview](https://epro.veevavault.help/en/gr/26597/)).
- **Access.** That page says Loader only extracts data the user can access.
- **API.** The Loader extract API accepts at most 10 data objects per request, and `extract_options` (source and renditions) applies only to `documents__v` and `document_versions__v` ([Veeva Developer Portal: extract data files](https://general.veevavault.dev/vault-api/api-reference/23.3/vault-loader/multi-file-extract/extract-data-files/)).
- **Loader's own audit.** Since 24R3, Vault no longer tracks Vault Loader actions, including data export, in the System Audit History. Loader actions on documents and object records remain in the Document and Object Record Audit Histories, though the page does not say whether extracts appear there ([Veeva: Vault Loader overview](https://epro.veevavault.help/en/gr/26597/)).

## Steps to demonstrate accuracy and completeness

1. **Define the scope in writing.** Name the document types and objects, which versions (all, or latest), whether relationships, source files and renditions are in scope, and the cut-off date and time.
2. **Fix the conditions.** Use an extracting account whose access covers the whole scope and record that account and its permissions. Navata recommendation: do not rely on an administrator's access being "obviously enough"; show it.
3. **Take an independent count first.** Obtain record counts per type from a source other than the extract itself (for example a Vault report or query, run by someone with the same access). Record the time.
4. **Allow for reindexing.** Quiesce creation where practicable, or wait and re-run, so that records created just before the extract are not silently absent. The one-minute figure is Veeva's description; do not build your evidence on it. Prove the outcome by count.
5. **Run the extract within the limits.** Where a type could exceed its limit, partition with a WHERE clause (for example by date range or type) so that each batch is under the limit, and record each batch's criteria. Keep fields few enough to avoid the query-size limit.
6. **Reconcile.** Compare extract row counts to the independent counts per type, check that identifiers are unique and that batches neither overlap nor leave gaps, and investigate every difference. For files, reconcile the number of files in staging to the number of rows with links.
7. **Preserve the output.** Move files out of staging well inside the retention period, record a checksum for each, and store them with the extract request, parameters, counts and reviewer sign-off. Navata recommendation.
8. **Keep your own extract log.** Given that System Audit History no longer holds Loader export actions from 24R3, the record of who ran what, when and with which parameters should be held in your own controlled record.
9. **Handle what the extract may not contain.** Test, with a sample, whether the fields you need, including audit trail information, are in the output. Where they are not, supply them through another documented route and say so in the inspection pack.

## Practitioner View

The usual failure is a count that nobody checked. An extract that finishes without error is treated as complete, when the real risks are quiet ones: a user whose access is narrower than assumed, a large type split into batches that leave a gap, a record created minutes before the run, or staged files deleted before they were saved. An inspector's follow-up question will probably be "how do you know this is everything?". A one-page reconciliation, with independent counts, batch criteria, differences explained and a named reviewer, answers it. Where the copying process is repeatable, treat it as a controlled procedure and test it, in line with the MHRA remark that copying processes must be validated. Do not claim more than you have shown: if audit trails or particular metadata were not in the extract, say what was provided instead.

## Unresolved points

- The units behind the "Limit" column (rows versus files per batch) are not defined on the page opened; confirm them for your Vault release before relying on them.
- Whether a Loader extract can include audit trail data was not established from the sources opened.
- The EU Annex 11 (2011) and the MHRA GxP data integrity guidance (2018) were located but their text could not be read in this research, so no clause-level claim is made from them.
- Release notes may change limits; check the current Veeva help for your release.

## Sources

- [Veeva: extracting with Vault Loader](https://platform.veevavault.help/en/gr/31536)
- [Veeva: Vault Loader overview](https://epro.veevavault.help/en/gr/26597/)
- [Veeva Developer Portal: extract data files](https://general.veevavault.dev/vault-api/api-reference/23.3/vault-loader/multi-file-extract/extract-data-files/)
- [21 CFR 11.10](https://www.law.cornell.edu/cfr/text/21/11.10)
- [MHRA Inspectorate blog](https://mhrainspectorate.blog.gov.uk/2016/12/14/2016-mhra-laboratories-symposium-your-questions)
