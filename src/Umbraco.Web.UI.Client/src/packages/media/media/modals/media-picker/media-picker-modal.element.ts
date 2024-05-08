import {
	type UmbMediaItemModel,
	UmbMediaItemRepository,
	UmbMediaUrlRepository,
	UmbMediaDetailRepository,
} from '../../repository/index.js';
import { UmbMediaTreeRepository } from '../../tree/media-tree.repository.js';
import type { UmbMediaCardItemModel } from './types.js';
import type { UmbMediaPickerFolderPathElement } from './components/media-picker-folder-path.element.js';
import type { UmbMediaPickerModalData, UmbMediaPickerModalValue } from './media-picker-modal.token.js';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { css, html, customElement, state, repeat, ifDefined } from '@umbraco-cms/backoffice/external/lit';
import type { UUIInputEvent } from '@umbraco-cms/backoffice/external/uui';
import { mime } from '@umbraco-cms/backoffice/external/mime';
import { type UmbAllowedMediaTypeModel, UmbMediaTypeStructureRepository } from '@umbraco-cms/backoffice/media-type';

@customElement('umb-media-picker-modal')
export class UmbMediaPickerModalElement extends UmbModalBaseElement<UmbMediaPickerModalData, UmbMediaPickerModalValue> {
	#mediaTreeRepository = new UmbMediaTreeRepository(this); // used to get file structure
	#mediaUrlRepository = new UmbMediaUrlRepository(this); // used to get urls
	#mediaItemRepository = new UmbMediaItemRepository(this); // used to search

	#mediaItemsCurrentFolder: Array<UmbMediaCardItemModel> = [];

	@state()
	private _mediaFilteredList: Array<UmbMediaCardItemModel> = [];

	@state()
	private _searchOnlyThisFolder = false;

	@state()
	private _searchQuery = '';

	@state()
	private _currentPath: string | null = null;

	@state()
	private _selectableNonImages = true;

	@state()
	private _allowedMediaTypes: Array<UmbAllowedMediaTypeModel> = [];

	@state()
	_popoverOpen = false;

	#mediaTypeStructure = new UmbMediaTypeStructureRepository(this);

	connectedCallback(): void {
		super.connectedCallback();
		this._selectableNonImages = this.data?.selectableNonImages ?? true;
		this._currentPath = this.data?.startNode ?? null;
		this.#loadMediaFolder();
	}

	async #loadMediaFolder() {
		const { data } = await this.#mediaTreeRepository.requestTreeItemsOf({
			parentUnique: this._currentPath,
			skip: 0,
			take: 100,
		});

		this.#mediaItemsCurrentFolder = await this.#mapMediaUrls(data?.items ?? []);
		this.#filterMediaItems();
		this.#getAllowedMediaTypes();
	}

	async #mapMediaUrls(items: Array<UmbMediaItemModel>): Promise<Array<UmbMediaCardItemModel>> {
		if (!items.length) return [];

		const { data } = await this.#mediaUrlRepository.requestItems(items.map((item) => item.unique));

		return items.map((item): UmbMediaCardItemModel => {
			const url = data?.find((media) => media.unique === item.unique)?.url;
			const extension = url?.split('.').pop();
			const isImage = url ? !!mime.getType(url)?.startsWith('image/') : false;

			return { name: item.name, unique: item.unique, isImage, url, extension };
		});
	}

	#onOpen(item: UmbMediaCardItemModel) {
		this._currentPath = item.unique!;
		this.#loadMediaFolder();
	}

	#onSelected(item: UmbMediaCardItemModel) {
		const selection = this.data?.multiple ? [...this.value.selection, item.unique!] : [item.unique!];
		this.modalContext?.setValue({ selection });
	}

	#onDeselected(item: UmbMediaCardItemModel) {
		const selection = this.value.selection.filter((value) => value !== item.unique);
		this.modalContext?.setValue({ selection });
	}

	async #filterMediaItems() {
		if (!this._searchQuery) {
			// No search query, show all media items in current folder.
			this._mediaFilteredList = this.#mediaItemsCurrentFolder;
			return;
		}

		const query = this._searchQuery;
		const { data } = await this.#mediaItemRepository.search({ query, skip: 0, take: 100 });

		if (!data) {
			// No search results.
			this._mediaFilteredList = [];
			return;
		}

		if (this._searchOnlyThisFolder) {
			// Don't have to map urls here, because we already have everything loaded within this folder.
			this._mediaFilteredList = this.#mediaItemsCurrentFolder.filter((media) =>
				data.find((item) => item.unique === media.unique),
			);
			return;
		}

		// Map urls for search results as we are going to show for all folders (as long they aren't trashed).
		this._mediaFilteredList = await this.#mapMediaUrls(
			data.filter((found) => {
				found.isTrashed ? false : false;
			}),
		);
	}

	#onSearch(e: UUIInputEvent) {
		this._searchQuery = (e.target.value as string).toLocaleLowerCase();
		this.#filterMediaItems();
	}

	#onPathChange(e: CustomEvent) {
		this._currentPath = (e.target as UmbMediaPickerFolderPathElement).currentPath;
		this.#loadMediaFolder();
	}

	render() {
		return html`
			<umb-body-layout headline=${this.localize.term('defaultdialogs_selectMedia')}>
				${this.#renderBody()} ${this.#renderPath()}
				<div slot="actions">
					<uui-button label=${this.localize.term('general_close')} @click=${this._rejectModal}></uui-button>
					<uui-button
						label=${this.localize.term('general_submit')}
						look="primary"
						color="positive"
						@click=${this._submitModal}></uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	#renderBody() {
		return html`${this.#renderToolbar()}
		<umb-dropzone id="dropzone" @change=${() => this.#loadMediaFolder()} .parentUnique=${this._currentPath}></umb-dropzone>
				${
					!this._mediaFilteredList.length
						? html`<div class="container"><p>${this.localize.term('content_listViewNoItems')}</p></div>`
						: html`<div id="media-grid">
								${repeat(
									this._mediaFilteredList,
									(item) => item.unique,
									(item) => this.#renderCard(item),
								)}
							</div>`
				}
			</div>`;
	}

	#renderToolbar() {
		return html`<div id="toolbar">
			${this.#renderDropdown()}
			<div id="search">
				<uui-input
					label=${this.localize.term('general_search')}
					placeholder=${this.localize.term('placeholders_search')}
					@change=${this.#onSearch}>
					<uui-icon slot="prepend" name="icon-search"></uui-icon>
				</uui-input>
			</div>
			<uui-button label="TODO" compact @click=${() => alert('TODO: Show media items as list/grid')}
				><uui-icon name="icon-grid"></uui-icon
			></uui-button>
		</div>`;
	}

	// Where should this be placed, without it looking terrible?
	// <uui-checkbox @change=${() => (this._searchOnlyThisFolder = !this._searchOnlyThisFolder)} label=${this.localize.term('general_excludeFromSubFolders')}></uui-checkbox>

	#onPopoverToggle(event: ToggleEvent) {
		this._popoverOpen = event.newState === 'open';
	}

	async #getAllowedMediaTypes() {
		let mediaType: string | null = null;
		if (this._currentPath) {
			const { data: media } = await this.#mediaItemRepository.requestItems([this._currentPath]);
			mediaType = media?.[0].mediaType.unique ?? null;
		}

		const { data: allowedMediaTypes } = await this.#mediaTypeStructure.requestAllowedChildrenOf(mediaType);
		this._allowedMediaTypes = allowedMediaTypes?.items ?? [];
	}

	#renderDropdown() {
		return html`
			<uui-button
				popovertarget="collection-action-menu-popover"
				label=${this.localize.term('actions_create')}
				color="default"
				look="outline">
				${this.localize.term('actions_create')}
				<uui-symbol-expand .open=${this._popoverOpen}></uui-symbol-expand>
			</uui-button>
			<uui-popover-container
				id="collection-action-menu-popover"
				placement="bottom-start"
				@toggle=${this.#onPopoverToggle}>
				<umb-popover-layout>
					<uui-scroll-container>
						${!this._allowedMediaTypes.length
							? html`<div id="not-allowed">${this.localize.term('mediaPicker_notAllowed')}</div>`
							: repeat(
									this._allowedMediaTypes,
									(item) => item.unique,
									(item) =>
										html`<uui-menu-item
											label=${item.name}
											@click=${() =>
												alert(
													'TODO: Open workspace (create) from modal. You can drop the files into this modal for now.',
												)}>
											<umb-icon slot="icon" name=${item.icon ?? 'icon-circle-dotted'}></umb-icon>
										</uui-menu-item>`,
								)}
					</uui-scroll-container>
				</umb-popover-layout>
			</uui-popover-container>
		`;
	}

	#renderCard(item: UmbMediaCardItemModel) {
		return html`
			<uui-card-media
				.name=${item.name ?? 'Unnamed Media'}
				@open=${() => this.#onOpen(item)}
				@selected=${() => this.#onSelected(item)}
				@deselected=${() => this.#onDeselected(item)}
				?selected=${this.value?.selection?.find((value) => value === item.unique)}
				?selectable=${item.isImage || this._selectableNonImages}
				file-ext=${ifDefined(item.extension)}>
				${item.isImage && item.url ? html`<img src=${item.url} alt=${ifDefined(item.name)} />` : ''}
			</uui-card-media>
		`;
	}

	#renderPath() {
		return html`<umb-media-picker-folder-path
			slot="footer-info"
			.currentPath=${this._currentPath}
			@change=${this.#onPathChange}></umb-media-picker-folder-path>`;
	}

	static styles = [
		css`
			#toolbar {
				display: flex;
				gap: var(--uui-size-6);
				align-items: flex-start;
				margin-bottom: var(--uui-size-3);
			}
			#search {
				flex: 1;
			}
			#search uui-input {
				width: 100%;
				margin-bottom: var(--uui-size-3);
			}
			#search uui-icon {
				height: 100%;
				display: flex;
				align-items: stretch;
				padding-left: var(--uui-size-3);
			}
			#media-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
				grid-template-rows: repeat(auto-fill, 200px);
				gap: var(--uui-size-space-5);
			}
			#not-allowed {
				padding: var(--uui-size-space-3);
			}
		`,
	];
}

export default UmbMediaPickerModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-media-picker-modal': UmbMediaPickerModalElement;
	}
}
