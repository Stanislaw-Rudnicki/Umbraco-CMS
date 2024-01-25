import type { DataSourceResponse, UmbDataSourceErrorResponse } from '../../repository/data-source/index.js';
import type { UmbCreateFolderModel, UmbFolderModel, UmbUpdateFolderModel } from './types.js';
import type { UmbApi } from '@umbraco-cms/backoffice/extension-api';
export interface UmbFolderRepository extends UmbApi {
	createScaffold(parentUnique: string | null): Promise<DataSourceResponse<UmbFolderModel>>;
	create(args: UmbCreateFolderModel): Promise<DataSourceResponse<UmbFolderModel>>;
	request(unique: string): Promise<DataSourceResponse<UmbFolderModel>>;
	update(args: UmbUpdateFolderModel): Promise<DataSourceResponse<UmbFolderModel>>;
	delete(unique: string): Promise<UmbDataSourceErrorResponse>;
}
