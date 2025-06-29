/*
Copyright - 2024 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
Changes:
	- v1.0.0:
		- created
Doc reviewed 20250124
*/
/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Click on the Heading report buttons event listener
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class HeadingReportButtonClickEL {

	/**
	 * The HTML id of the button using the event listener
	 * @type {String}
	 */

	#buttonId;

	/**
	 * An array with all the buttons HTML Id using the event listener
	 * @type {Array.<String>}
	 */

	static #buttonsId = [];

	/**
	 * The HTML id of the pane linked to the button
	 * @type {String}
	 */

	#paneId;

	/**
	 * An array with all the pane HTML Id linked to the buttons
	 * @type {Array.<String>}
	 */

	static #panesId = [];

	/**
	 * The constructor
	 * @param {String} buttonId The HTML id of the button using the event listener
	 * @param {String} paneId The HTML id of the pane linked to the button
	 */

	constructor ( buttonId, paneId ) {
		this.#buttonId = buttonId;
		this.#paneId = paneId;
		HeadingReportButtonClickEL.#buttonsId.push ( buttonId );
		HeadingReportButtonClickEL.#panesId.push ( paneId );
		Object.freeze ( this );
	}

	/**
	 * event handler
	 */

	handleEvent ( ) {

		HeadingReportButtonClickEL.#buttonsId.forEach (
			buttonId => document.getElementById ( buttonId ).classList.remove ( 'selectedPaneButton' )
		);
		document.getElementById ( this.#buttonId ).classList.add ( 'selectedPaneButton' );

		HeadingReportButtonClickEL.#panesId.forEach (
			paneId => document.getElementById ( paneId ).classList.add ( 'hiddenPane' )
		);
		document.getElementById ( this.#paneId ).classList.remove ( 'hiddenPane' );

		if ( 'relationsButton' === this.#buttonId ) {
			document.getElementById ( 'routesLinks' ).classList.remove ( 'hiddenPane' );
		}
		else {
			document.getElementById ( 'routesLinks' ).classList.add ( 'hiddenPane' );
		}

	}
}

export default HeadingReportButtonClickEL;

/* --- End of file --------------------------------------------------------------------------------------------------------- */