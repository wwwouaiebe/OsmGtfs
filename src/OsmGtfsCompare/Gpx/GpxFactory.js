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
Doc reviewed 20250126
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import PolylineEncoder from '../../Common/PolylineEncoder.js';
import theGtfsPlatforms from '../DataLoading/GtfsPlatforms.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Factory for gpx file
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GpxFactory {

	/**
	 * The gpx file name (without extension)
	 * @type {String}
	 */

	#fileName;

	/**
	 * The route to push in the GPX file
	 * @type {Object}
	 */

	#route;

	/**
	 * An XML string with the route information
	 * @type {String}
	 */

	#gpxString;

	/**
	Simple constant for gpx presentation
	@type {String}
	*/

	static get #TAB0 ( ) { return '\n'; }

	/**
	Simple constant for gpx presentation
	@type {String}
	*/

	static get #TAB1 ( ) { return '\n\t'; }

	/**
	Simple constant for gpx presentation
	@type {String}
	*/

	static get #TAB2 ( ) { return '\n\t\t'; }

	/**
	Simple constant for gpx presentation
	@type {String}
	*/

	static get #TAB3 ( ) { return '\n\t\t\t'; }

	/**
	Simple constant for gpx presentation
	@type {String}
	*/

	static get #TAB4 ( ) { return '\n\t\t\t\t'; }

	/**
	Simple constant for polyline decompression
	@type {Number}
	*/

	// eslint-disable-next-line no-magic-numbers
	static get #polylinePrecision ( ) { return 6; }

	/**
	Creates the header of the gpx file
	*/

	#addHeader ( ) {

		// header
		this.#gpxString = '<?xml version="1.0"?>' + GpxFactory.#TAB0;
		this.#gpxString += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
		'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
		'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" ' +
		'version="1.1" creator="TravelNotes">';
	}

	/**
	Creates the footer of the gpx file
	*/

	#addFooter ( ) {
		this.#gpxString += GpxFactory.#TAB0 + '</gpx>';
	}

	/**
	Replace the chars &, ', ", < and > with entities
	@param {String} text The text containing reserved chars
	@return {String} The text with reserved chars replaced by entities
	*/

	#replaceEntities ( text ) {
		return ( text.replaceAll ( '&', '&amp;' )
			.replaceAll ( /\u0027/g, '&apos;' )
			.replaceAll ( /"/g, '&quot;' )
			.replaceAll ( /</g, '&lt;' )
			.replaceAll ( />/g, '&gt;' )
		);
	}

	/**
	Add the waypoints to the gpx file
	*/

	#addWayPoints ( ) {
		this.#route.platforms.forEach (
			( currentPlatformRef, index ) => {
				const gtfsPlatform = theGtfsPlatforms.getPlatform ( currentPlatformRef );
				console.log ( gtfsPlatform );
				this.#gpxString +=
					GpxFactory.#TAB1 + '<wpt lat="' +
					gtfsPlatform.lat +
					'" lon="' +
					gtfsPlatform.lon + '">' +
					GpxFactory.#TAB2 + '<name>' +
					String ( index + 1 ) + ' - ' +
					this.#replaceEntities ( gtfsPlatform.nameOperator ) +
					' ( ' + this.#replaceEntities ( gtfsPlatform.gtfsRef ) + ' ) ' +
					'</name>' +
					GpxFactory.#TAB1 + '</wpt>';
			}
		);
	}

	/**
	Add the track to the gpx file
	*/

	#addTrack ( ) {
		this.#gpxString += GpxFactory.#TAB1 + '<trk>';
		this.#gpxString += GpxFactory.#TAB2 + '<name>' +
			this.#replaceEntities ( this.#fileName ) +
			'</name>';
		this.#gpxString += GpxFactory.#TAB2 + '<trkseg>';

		const routeNodes = new PolylineEncoder ( ).decode (
			this.#route.nodes,
			[ GpxFactory.#polylinePrecision, GpxFactory.#polylinePrecision ]
		);

		routeNodes.forEach (
			routeNode => {
				this.#gpxString +=
                    GpxFactory.#TAB3 +
                    '<trkpt lat="' + routeNode [ 0 ] + '" lon="' + routeNode [ 1 ] + '">' +
                    GpxFactory.#TAB3 + '</trkpt>';
			}
		);

		this.#gpxString += GpxFactory.#TAB2 + '</trkseg>';
		this.#gpxString += GpxFactory.#TAB1 + '</trk>';
	}

	/**
	Save a string to a file
	@param {String} fileContent The file content
	@param {?string} fileMimeType The mime type of the file. Default to 'text/plain'
	*/

	#saveFile ( fileContent, fileMimeType ) {
		try {
			const objURL =
				fileMimeType
					?
					window.URL.createObjectURL ( new File ( [ fileContent ], this.#fileName + '.gpx', { type : fileMimeType } ) )
					:
					URL.createObjectURL ( fileContent );
			const element = document.createElement ( 'a' );
			element.setAttribute ( 'href', objURL );
			element.setAttribute ( 'download', this.#fileName + '.gpx' );
			element.click ( );
			window.URL.revokeObjectURL ( objURL );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}

	/**
	 * Build and save the GPX file
	 * @param {Object} route The toute to save in the GPX file
	 * @param {String} fileName The file name to use
	 */

	buildGpx ( route, fileName ) {
		this.#route = route;
		this.#fileName = fileName;
		this.#addHeader ( );
		this.#addWayPoints ( );
		this.#addTrack ( );
		this.#addFooter ( );
		this.#saveFile ( this.#gpxString, 'application/xml' );
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default GpxFactory;

/* --- End of file --------------------------------------------------------------------------------------------------------- */