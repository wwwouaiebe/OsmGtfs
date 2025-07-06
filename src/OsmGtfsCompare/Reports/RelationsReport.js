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

import theGtfsPlatforms from '../DataLoading/GtfsPlatforms.js';
import JosmButtonClickEL from '../interface/JosmButtonClickEL.js';
import GpxButtonClickEL from '../interface/GpxButtonClickEL.js';
import theDocConfig from '../interface/DocConfig.js';
import Report from '../Reports/Report.js';

/*
Structure of the report:
+--------------------------------------+
| div id=osm.....                      |
| +----------------------------------+ |
| | h1                               | |
| +----------------------------------+ |
| +----------------------------------+ |
| | div id=osm.....DataDiv           | |
| | +------------------------------+ | |
| | | h3                           | | |
| |	+------------------------------+ | |
| | +------------------------------+ | |
| | | p                            | | |
| | +------------------------------+ | |
| +----------------------------------+ |
| +----------------------------------+ |
| | div id=osm.....                  | |
| | +------------------------------+ | |
| | | h2                           | | |
| | +------------------------------+ | |
| | +------------------------------+ | |
| | | div id=osm.....DataDiv       | | |
| | | +--------------------------+ | | |
| | | | h3                       | | | |
| | | +--------------------------+ | | |
| | | +--------------------------+ | | |
| | | | p                        | | | |
| | | +--------------------------+ | | |
| | | +--------------------------+ | | |
| | | | p                        | | | |
| | | +--------------------------+ | | |
| | +------------------------------+ | |
| +----------------------------------+ |
+--------------------------------------+
*/

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * This class contains methods to create the report
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RelationsReport extends Report {

	/**
	 * The current div with a h1 heading where the element of the report will be added
	 * @type {HTMLElement}
	 */

	#currentH1Div = null;

	/**
	 * The current div with a h2 heading where the element of the report will be added
	 * @type {HTMLElement}
	 */

	#currentH2Div = null;

	/**
	 * The current div with a osm...DataDiv id where the element of the report will be added
	 * @type {HTMLElement}
	 */

	#currentDataDiv = null;

	/**
	 * the currently added HTMLElement
	 * @type {HTMLElement}
	 */

	#currentHTMLElement = null;

	/**
	 * The constructor
	 */

	constructor ( ) {
		super ( );
		this.report = document.getElementById ( 'relationsPane' );
		Object.freeze ( this );
	}

	/**
	 * This method close the report (= do some actions at the end of the process)
	 */

	close ( ) {

		// Add event listeners on josm buttons
		const josmButtons = document.getElementsByClassName ( 'josmButton' );
		for ( let counter = 0; counter < josmButtons.length; counter ++ ) {
			josmButtons[ counter ].addEventListener ( 'click', new JosmButtonClickEL ( ) );
		}

		// Add event listeners on gpx buttons
		const gpxButtons = document.getElementsByClassName ( 'gpxButton' );
		for ( let counter = 0; counter < gpxButtons.length; counter ++ ) {
			gpxButtons[ counter ].addEventListener ( 'click', new GpxButtonClickEL ( ) );
		}

		// adding bus shortcuts
		let routesLinksdiv = document.getElementById ( 'routesLinks' );

		/*
		theOsmDataLoader.routeMasters.forEach (
			routeMaster => {
				let routeLink = document.createElement ( 'a' );
				routeLink.classList.add ( 'busShortcutAnchor' );
				routeLink.innerText = routeMaster.tags.ref + ' ';
				routeLink.href = '#osm' + routeMaster.id;
				routesLinksdiv.appendChild ( routeLink );
			}
		);
		*/

		// Hidding the animation
		document.getElementById ( 'waitAnimation' ).style.visibility = 'hidden';

	}

	/**
	 * This method open the report (= do some actions at the beginning of the process)
	 */

	open ( ) {

		super.open ( );

		// show the animation
		document.getElementById ( 'waitAnimation' ).style.visibility = 'visible';

		// reset of the errorOnly class
		this.report.classList.remove ( 'errorsOnly' );

		let routesLinksdiv = document.getElementById ( 'routesLinks' );
		while ( routesLinksdiv.firstChild ) {
			routesLinksdiv.removeChild ( routesLinksdiv.firstChild );
		}

	}

	/**
	 * Return an HTML string with a "Download gpx" button
	 * @param {?Number} shapePk A unique identifier given to a GTFS route and coming from mySQL db
	 * @param {String} fileName the file name to use when the button is clicked
	 * @returns {String} a HTML string with an ButtonHTMLElement or an empty string when the shapePk is null
	 */

	#getGpxDownloadButton ( shapePk, fileName ) {
		const gpxDownloadButton =
				'<button title="download the gpx file" ' +
				'class="gpxButton" data-shape-pk="' +
				shapePk + '" + data-file-name ="' + fileName + '" >Download gpx</button>';

		return gpxDownloadButton;
	}

	/**
	 * Convert a date to the format year-month-day
	 * @param {String} sourceDate The date as in the json file. Dates in the json file are ISO date with UTC hours...
	 * @returns {String} the date in the format year-month-day
	 */

	#convertDate ( sourceDate ) {
		let tmpDate =
			new Date ( sourceDate )
				.toLocaleDateString ( )
				.split ( '/' );

		return tmpDate [ 2 ] + '-' + tmpDate [ 1 ] + '-' + tmpDate [ 0 ];
	}

	/**
	 * Get the gpx route name
	 * @param {Object} routeMaster the routeMaster for witch the gpx route name is searched
	 * @param {Object} route the route for witch the gpx route name is searched
	 * @returns {String} the route name
	 */

	#getGpxRouteName ( routeMaster, route ) {
		const startPlatform = theGtfsPlatforms.getPlatform ( route.platforms [ 0 ] );
		const lastPlatform = theGtfsPlatforms.getPlatform ( route.platforms.slice ( -1 ) [ 0 ] );

		let gpxRouteName =
            theDocConfig.vehicle + ' ' +
            routeMaster.ref + ' - from ' + startPlatform.nameOperator +
            ' (' + startPlatform.gtfsRef + ') to ' +
            lastPlatform.nameOperator + ' (' + lastPlatform.gtfsRef + ') - ' +
            route.shapePk + ' - valid from ' + this.#convertDate ( route.startDate ) +
            ' - valid to ' + this.#convertDate ( route.endDate );

		return gpxRouteName;
	}

	/**
	 * Add a p htmlElement with a gpx download button and the gpx file name
	 * @param {*} routeMaster
	 * @param {*} route
	 */

	addGpxRoute ( routeMaster, route ) {
		const gpxRouteName = this.#getGpxRouteName ( routeMaster, route );
		const pElement = document.createElement ( 'p' );
		pElement.innerHTML = this.#getGpxDownloadButton ( route.shapePk, gpxRouteName ) + gpxRouteName;
		this.report.appendChild ( pElement );
	}

}

/**
 * The one and only one object Report
 * @type {RelationsReport}
 */

const theRelationsReport = new RelationsReport ( );

export default theRelationsReport;

/* --- End of file --------------------------------------------------------------------------------------------------------- */