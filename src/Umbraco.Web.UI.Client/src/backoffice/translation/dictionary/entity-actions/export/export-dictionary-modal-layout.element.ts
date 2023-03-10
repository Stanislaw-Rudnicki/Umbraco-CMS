import { html } from 'lit';
import { UUITextStyles } from '@umbraco-ui/uui-css/lib';
import { customElement, query } from 'lit/decorators.js';
import { UmbModalLayoutElement } from '@umbraco-cms/modal';

export interface UmbExportDictionaryModalData {
	unique: string | null;
}

export interface UmbExportDictionaryModalResultData {
	includeChildren?: boolean;
}

@customElement('umb-export-dictionary-modal-layout')
export class UmbExportDictionaryModalLayoutElement extends UmbModalLayoutElement<UmbExportDictionaryModalData> {
	static styles = [UUITextStyles];

	@query('#form')
	private _form!: HTMLFormElement;

	#handleClose() {
		this.modalHandler?.close();
	}

	#submitForm() {
		this._form?.requestSubmit();
	}

	async #handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		if (!form) return;

		const formData = new FormData(form);

		this.modalHandler?.submit({ includeChildren: (formData.get('includeDescendants') as string) === 'on' });
	}

	render() {
		return html` <umb-body-layout headline="Export">
			<uui-form>
				<form id="form" name="form" @submit=${this.#handleSubmit}>
					<uui-form-layout-item>
						<uui-label for="includeDescendants" slot="label">Include descendants</uui-label>
						<uui-toggle id="includeDescendants" name="includeDescendants"></uui-toggle>
					</uui-form-layout-item>
				</form>
			</uui-form>
			<uui-button slot="actions" type="button" label="Cancel" look="secondary" @click=${this.#handleClose}></uui-button>
			<uui-button slot="actions" type="button" label="Export" look="primary" @click=${this.#submitForm}></uui-button>
		</umb-body-layout>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-export-dictionary-modal-layout': UmbExportDictionaryModalLayoutElement;
	}
}
