---
title: "What Provenance and Completeness Controls Are Needed When Vault Direct Data Extracts Feed AI Training or Retrieval?"
route: "/insights/what-provenance-and-completeness-controls-are-needed-when-vault-direct-data"
canonical: "https://rohithkspersonal.github.io/insights/what-provenance-and-completeness-controls-are-needed-when-vault-direct-data"
description: "Veeva documents that Direct Data excludes document source files, annotation metadata, document roles and workflow participant group details, and publishes…"
seoTitle: "Vault Direct Data for AI: Provenance and Completeness"
publicationId: "PUB-LIB-9006-r3-v28"
itemId: "LIB-9006"
contentRevision: 3
render: "navata-test-site@1"
---
# What Provenance and Completeness Controls Are Needed When Vault Direct Data Extracts Feed AI Training or Retrieval?

A pipeline that feeds Vault Direct Data into AI training or retrieval needs two things that Direct Data does not provide for you: a provenance record that ties every training set or index build to the exact files it was built from, and a completeness check that compares what you loaded with what Veeva says each file contains and with what Direct Data is documented not to contain. Veeva documents the exclusions, the file schedule, the per-file manifest and the short download windows; no source opened for this article prescribes a specific provenance record, so the record and checks below are Navata interpretation applied to those documented behaviours and to the general record controls in 21 CFR 11.10.

## What Veeva documents about Direct Data

The statements in this section are factual descriptions taken from Veeva's developer portal pages as read on 14 October 2026. The pages read are not tied to a named Vault release, so confirm each behaviour in your own Vault before it goes into a design record.

**Scope and exclusions.** The overview page says the document data excludes "annotation metadata, document roles, and source document, rendition, and text files themselves", although it includes references to download those files. For workflows it says the extract "excludes participant group details". Picklists not referenced by objects or documents in the extract are excluded. The page also says the API is "not designed for real-time application integration", is "not enabled by default" and "is not configurable", and that the available extracts "may vary depending on the Vault application" ([Veeva: Direct Data API overview](https://general.veevavault.dev/direct-data-api/overview); [Veeva: Direct Data file structure](https://general.veevavault.dev/direct-data-api/references/file-structure/)).

**File types and timing.** Full files are published once a day at 01:00 Vault Time for the previous day and stay downloadable for two days. Incremental files are published for each 15-minute interval (96 a day), exactly 15 minutes after their `stop_time`, and stay downloadable for ten days. Log files carry audit log data for a single day, are published at 01:00 Vault Time and stay downloadable for two days. File names follow `{vaultid}-{date}-{stop_time}-{type}.tar.gz.{filepart}`, files over 1 GB are split into parts, `stop_time` is always UTC, and the Full and Log schedules follow Vault Time without daylight saving adjustment. Changing the Vault time zone can temporarily produce up to three Full files and a one-time delay of up to 24 hours ([Veeva: Direct Data file structure](https://general.veevavault.dev/direct-data-api/references/file-structure/)).

**Consistency.** Veeva describes the data as a transactionally consistent view of the Vault at a given time, the `stop_time` ([Veeva: Direct Data API overview](https://general.veevavault.dev/direct-data-api/overview)).

**Manifest.** Every file has a `manifest.csv` at the root. Its columns are `extract`, `extract_label`, `type` (`updates` or `deletes`, present only for incremental files), `records` and `file`. The `records` value can be zero and the `file` value can then be absent ([Veeva: manifest CSV](https://general.veevavault.dev/direct-data-api/references/manifest)).

**Metadata.** A Full file carries `metadata.csv` describing the structure of each extract. An Incremental file carries only metadata that changed in its interval, a `metadata_deletes.csv` when metadata was removed, and a root-level `metadata_full.csv` identical to the Full file's `metadata.csv` apart from `modified_date` being null. The `metadata_full.csv` file is not listed in the manifest ([Veeva: metadata CSV](https://general.veevavault.dev/direct-data-api/references/metadata)).

**File listing.** The listing API returns, for each file, its name, size, a `record_count` (zero if there is no data for the period), the file parts and an `md5checksum` per part. A file that fails to publish for an interval appears with an `error` object and a `next_retry` time. The page does not say how to verify a download against the checksum or how to detect gaps in a sequence ([Veeva: retrieve available Direct Data files](https://general.veevavault.dev/vault-api/api-reference/26.1/direct-data/retrieve-available-direct-data-files/)).

**Processing.** Veeva's processing guide says that processing many incremental updates can introduce subtle inconsistencies from processing errors or network issues, that recovering from them by replaying incrementals can be complex and slow, and that a full resynchronisation from a Full file resets to a known state. Formula fields are evaluated at initial staging for Full files and, for Incremental files, when a record changes. After a Vault release the page expects "a large number of updates within a short period" ([Veeva: processing Direct Data files](https://general.veevavault.dev/direct-data-api/guides/processing-files/)).

## What the regulatory sources say, and what they do not

21 CFR 11.10 applies to closed systems that hold electronic records under the predicate rules. It calls for validation of systems, including the ability to discern invalid or altered records (a), accurate and complete copies of records in human readable and electronic form suitable for inspection (b), protection of records for accurate and ready retrieval throughout retention (c), and computer-generated, time-stamped audit trails where "record changes shall not obscure previously recorded information" (e) ([21 CFR 11.10](https://www.law.cornell.edu/cfr/text/21/11.10)). The regulation does not mention Direct Data, AI, training sets or retrieval indexes. Whether a downstream AI copy is itself a regulated record, or is only a working copy of one, is a determination for the organisation; this article does not make it.

The European Commission consultation page describes a draft Annex 22 on artificial intelligence that covers model selection, training and validation, intended use, performance metrics, and training and test data, alongside a revised Annex 11. The consultation ran from 7 July to 7 October 2025 and is closed ([European Commission consultation](https://health.ec.europa.eu/consultations/stakeholders-consultation-eudralex-volume-4-good-manufacturing-practice-guidelines-chapter-4-annex_en)). The draft text itself was not read for this article, and its final status was not established, so no clause-level claim is made from it.

## The provenance record (Navata interpretation)

For each ingestion run, hold a record that can be read without access to the pipeline. At minimum:

1. **Source file identity.** Vault ID, file name as listed, type (Full, Incremental or Log), `stop_time`, every file part, size, and the `md5checksum` per part as returned by the listing API at download time. Also record the checksum you compute on the concatenated archive, because Veeva does not document how its value should be used.
2. **Retrieval event.** Time of download, the integration identity used, the Vault API version, and the listing response saved verbatim.
3. **Manifest as received.** The full `manifest.csv`, stored unaltered, with the `metadata.csv` or `metadata_full.csv` that applied.
4. **Lineage to the AI artefact.** For each training set, evaluation set or retrieval index build: the list of source file identities it was built from, the extract names used, the filter and transformation code version, and the count of records in and out at each step.
5. **Exclusion statement.** A fixed statement, reviewed against the overview page at each release, of what Direct Data does not carry and therefore what the artefact cannot reflect.
6. **Retention.** The listed files expire after two or ten days, so the pipeline's own copy of the raw files, or a documented decision not to keep them, is the only way to reproduce a build later. Retention of the raw files is the customer's decision.

## The completeness checks (Navata interpretation)

- **Manifest reconciliation.** For every extract row, compare `records` with the rows actually parsed from the CSV named in `file`. Treat a missing file with a non-zero count as a failure, and a missing file with zero records as expected.
- **Listing reconciliation.** Compare the listing's `record_count` with the sum of manifest `records`. Veeva describes `record_count` as a total across extracts, so a difference is a prompt to investigate rather than a proven fault.
- **Sequence continuity.** Incremental windows are 15 minutes wide, so successive files should have contiguous `stop_time` values. Veeva does not document gap detection, so the pipeline must do it, and must treat a listing entry in error state as a gap until the retried file publishes. Given the ten-day window, a gap not closed in time cannot be filled from the missing incremental and should trigger a re-baseline from a Full file.
- **Deletes.** The manifest `type` column separates `updates` from `deletes`. A retrieval index that applies updates but not deletes will keep returning content for records Vault no longer holds. Applying them in `stop_time` order is Navata recommendation; the ordering rule is not stated in the pages read.
- **Metadata drift.** Compare the metadata applying to each file with the previous run. A removed field appears in `metadata_deletes.csv`; a pipeline that ignores it will carry a column Vault no longer defines.
- **Release windows.** After a Vault release, expect bursts of updates. Hold evaluation of a model or index built in that window until the burst has been loaded and reconciled.

## What the exclusions mean for AI use

Because source, rendition and text files are not included, only references to them, any retrieval system that answers from document content has to fetch those files by another route. That route is outside the pages read here, so its completeness controls need their own treatment, for example the reconciliation approach in the related Navata page on Vault Loader extracts below. Because document roles are excluded, Direct Data cannot be the source for deciding which users may see which documents in a permission-aware retrieval service; that access information has to come from elsewhere and be shown to be current. Because workflow participant group details are excluded, a pipeline cannot reconstruct who was a participant by group from this source, and should not infer approval history that the data does not hold. These consequences are Navata interpretation drawn from the documented exclusions.

## Practitioner View

The failure I would look for first is a model or index that cannot be traced to files. If the raw archive has expired from Veeva's two and ten day windows and the pipeline did not keep it, nobody can show what a given answer was built from, and the 21 CFR 11.10(b) idea of an accurate and complete copy cannot be demonstrated for that build. The second is silent delete handling in a retrieval index, which turns a withdrawn controlled document into a live answer source. I would also not accept a green load job as completeness evidence: I would want the manifest-to-parsed-rows reconciliation output, the contiguity check across `stop_time`, and a signed-off exclusion statement stored with each build. Test the gap path deliberately, by withholding one incremental in a sandbox and showing the pipeline stops.

## Unresolved points

- A third-party-style claim that incremental files reflect only the most recent change to a record within an interval was not found in any Veeva page opened. The pages say an Incremental file contains "the set of data which changed" in the interval and are silent on multiple changes to one record. Until you have tested it in a sandbox, do not rely on incrementals to reconstruct a record's intermediate states; use the Log files and the Vault audit trails for change history, and verify what they carry.
- How the `md5checksum` should be verified and whether it covers each part or the assembled archive is not documented on the page opened.
- The ordering rule for applying updates and deletes is not stated in the pages read.
- The pages are not tied to a named release and may change; check the current developer portal and release notes.
- The draft Annex 22 and revised Annex 11 texts were not read, and their final status was not established.
- How to fetch the source documents that Direct Data references, and their completeness controls, was not researched.

## Related Navata guidance

- "How to Show That a Vault Loader Extract Is an Accurate and Complete Copy of Vault Records for an Inspector": the independent-count and reconciliation approach applies equally to the separate route you will need for document files.
- "What Governance Is Needed When Veeva Vault Data Leaves the System Through the Direct Data API?": the wider governance question around the same interface, which this article does not attempt to answer.

## Sources

- [Veeva: Direct Data API overview](https://general.veevavault.dev/direct-data-api/overview)
- [Veeva: Direct Data file structure](https://general.veevavault.dev/direct-data-api/references/file-structure/)
- [Veeva: manifest CSV](https://general.veevavault.dev/direct-data-api/references/manifest)
- [Veeva: metadata CSV](https://general.veevavault.dev/direct-data-api/references/metadata)
- [Veeva: retrieve available Direct Data files](https://general.veevavault.dev/vault-api/api-reference/26.1/direct-data/retrieve-available-direct-data-files/)
- [Veeva: processing Direct Data files](https://general.veevavault.dev/direct-data-api/guides/processing-files/)
- [21 CFR 11.10](https://www.law.cornell.edu/cfr/text/21/11.10)
- [European Commission consultation](https://health.ec.europa.eu/consultations/stakeholders-consultation-eudralex-volume-4-good-manufacturing-practice-guidelines-chapter-4-annex_en)
