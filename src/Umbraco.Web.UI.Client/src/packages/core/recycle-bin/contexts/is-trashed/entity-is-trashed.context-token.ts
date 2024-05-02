import type { UmbEntityIsTrashedContext } from './entity-is-trashed.context.js';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';

export const UMB_ENTITY_IS_TRASHED_CONTEXT = new UmbContextToken<UmbEntityIsTrashedContext>(
	'UmbEntityIsTrashedContext',
);
