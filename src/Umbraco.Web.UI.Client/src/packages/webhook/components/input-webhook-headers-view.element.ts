import type { PropertyValueMap } from '@umbraco-cms/backoffice/external/lit';
import { css, html, customElement, state, property, repeat, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbWorkspaceViewElement } from '@umbraco-cms/backoffice/extension-registry';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import '@umbraco-cms/backoffice/culture';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';

@customElement('umb-input-webhook-headers')
export class UmbInputWebhookHeadersElement extends UmbLitElement implements UmbWorkspaceViewElement {
	@property()
	public headers: { [key: string]: string } = {};

	@state()
	private _headers: Array<{ name: string; value: string }> = [];

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		super.firstUpdated(_changedProperties);

		this._headers = Object.entries(this.headers).map(([name, value]) => ({ name, value }));
	}

	protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		super.updated(_changedProperties);

		if (_changedProperties.has('_headers')) {
			this.headers = this._headers.reduce(
				(acc, header) => {
					acc[header.name as string] = header.value;
					return acc;
				},
				{} as { [key: string]: string },
			);

			this.dispatchEvent(new UmbChangeEvent());
		}
	}

	#removeHeader(index: number) {
		this._headers = this._headers.filter((_, i) => i !== index);
	}

	#onInput(event: Event, prop: keyof (typeof this._headers)[number], index: number) {
		const value = (event.target as HTMLInputElement).value;
		this._headers[index][prop] = value;
		this.requestUpdate('_headers');
	}

	#renderHeaderInput(header: { name: string; value: string }, index: number) {
		return html`
			<input type="text" .value=${header.name} @input=${(e: InputEvent) => this.#onInput(e, 'name', index)} />
			<input type="text" .value=${header.value} @input=${(e: InputEvent) => this.#onInput(e, 'value', index)} />
			<button @click=${() => this.#removeHeader(index)}>Remove</button>
		`;
	}

	#renderHeaders() {
		if (!this._headers.length) return nothing;

		return html`
			<span>Name</span>
			<span>Value</span>
			<span></span>
			${repeat(
				this._headers,
				(_, index) => index,
				(header, index) => this.#renderHeaderInput(header, index),
			)}
		`;
	}

	#addHeader() {
		this._headers = [...this._headers, { name: '', value: '' }];
	}

	render() {
		return html`
			${this.#renderHeaders()}

			<uui-button id="add" look="placeholder" @click=${this.#addHeader}>Add</uui-button>
		`;
	}

	static styles = [
		UmbTextStyles,
		css`
			:host {
				display: grid;
				grid-template-columns: 1fr 1fr auto;
				gap: var(--uui-size-space-2) var(--uui-size-space-2);
			}

			#add {
				grid-column: -1 / 1;
			}
		`,
	];
}

export default UmbInputWebhookHeadersElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-input-webhook-headers': UmbInputWebhookHeadersElement;
	}
}
