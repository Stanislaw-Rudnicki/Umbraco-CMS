import type { ContentTreeItemResponseModel } from '@umbraco-cms/backoffice/backend-api';

export * from './components/index.js';
export * from './repository/index.js';

export { UMB_MEDIA_COLLECTION_ALIAS } from './collection/index.js';

// Content
export interface ContentProperty {
	alias: string;
	label: string;
	description: string;
	dataTypeId: string;
}

export interface ContentPropertyData {
	alias: string;
	value: any;
}

// Media
export interface UmbMediaDetailModel extends ContentTreeItemResponseModel {
	id: string; // TODO: Remove this when the backend is fixed
	isTrashed: boolean; // TODO: remove only temp part of refactor
	properties: Array<ContentProperty>;
	data: Array<ContentPropertyData>;
	variants: Array<any>; // TODO: define variant data
	//layout?: any; // TODO: define layout type - make it non-optional
	icon?: string;
}
