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

import JosmButtonClickEL from '../interface/JosmButtonClickEL.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * A base class for the reports
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class Report {

	/**
	 * The HTML element where the report is added
	 * @type {HTMLElement}
	 */

	report;

	/**
	 * The constructor
	 */

	constructor ( ) {

	}

	/**
	 * Return an HTML string with a "JOSM" button
	 * @param {?Object} osmObject The OSM object for witch the button must be created
	 * @returns {String} a HTML string with an ButtonHTMLElement or an empty string when the osmObject is null
	 */

	getJosmEdit ( osmObject ) {
		if ( ! osmObject?.id || ! osmObject?.type ) {
			return '';
		}

		let buttonHtml = '<button title="Edit the relation with JOSM\nJOSM must be already opened!" ' +
        	'class="josmButton" ' +
			'data-osm-obj-id="' + osmObject.id + '" ' +
			'data-osm-obj-type="' + osmObject.type + '" ';

		if ( osmObject.newTagValues ) {
			let keyCounter = 1;
			for ( const [ key, value ] of Object.entries ( osmObject.newTagValues ) ) {
				buttonHtml +=
					'data-tag-' + keyCounter + '="' + key + '=' + value + '" ';
				keyCounter ++;
			}
		}

		buttonHtml += '>JOSM </button>';

		return buttonHtml;
	}

	/**
	 * Return an HTML string with a OSM link
	 * @param {?Object} osmObject The OSM object for witch the link must be created
	 * @returns {String} a HTML string with an AnchorHTMLElement or an empty string when the osmObject is null
	 */

	getOsmLink ( osmObject ) {
		let osmId = '';
		if ( osmObject?.id && osmObject?.type ) {
			osmId = osmObject.id;
		}
		else if ( osmObject?.ref && osmObject?.type ) {
			osmId = osmObject.ref;
		}
		else {
			return '';
		}
		let osmType = osmObject.type;

		return '<a target="_blank" href="https://www.openstreetmap.org/' +
			osmType +
			'/' + osmId + '"> ' + osmType + ' : ' + osmId + '</a>';
	}

	/**
	 * Add something to the HTML report
	 * @param {String} htmlTag the type of the HTML element to add
	 * @param {String} text the text to add in the HTML element
	 * @param {?Object} osmObject an OSM object linked to the error to add in the report
	 */

	add ( htmlTag, text, osmObject ) {
		let htmlElement = document.createElement ( htmlTag );
		htmlElement.innerHTML =

            text +

			// JOSM button
			this.getJosmEdit ( osmObject );

		this.report.appendChild ( htmlElement );
	}

	/**
	 * Open the report ( = prepare the report for a new control)
	 */

	open ( ) {

		// clear the report
		while ( this.report.firstChild ) {
			this.report.removeChild ( this.report.firstChild );
		}
	}

	/**
	 * Close the report ( = do some operations at the end of a control)
	 */

	close ( ) {

		// Add event listeners on josm buttons
		const josmButtons = document.getElementsByClassName ( 'josmButton' );
		for ( let counter = 0; counter < josmButtons.length; counter ++ ) {
			josmButtons[ counter ].addEventListener ( 'click', new JosmButtonClickEL ( ) );
		}

	}
}

export default Report;