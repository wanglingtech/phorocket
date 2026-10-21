export const LEGAL_DOC_VERSIONS = {
  terms: '1.0.0',
  privacy: '1.0.0',
  copyright: '1.0.0',
  content: '1.0.0',
} as const;

export type LegalDocType = keyof typeof LEGAL_DOC_VERSIONS;
