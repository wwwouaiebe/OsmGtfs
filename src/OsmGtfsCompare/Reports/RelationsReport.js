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

import theGtfsPlatforms from '../../OsmGtfsCompare/DataLoading/GtfsPlatforms.js';
import JosmButtonClickEL from '../../OsmGtfsCompare/Interface/JosmButtonClickEL.js';
import GpxButtonClickEL from '../../OsmGtfsCompare/Interface/GpxButtonClickEL.js';
import RouteLinkClickEL from '../../OsmGtfsCompare/Interface/RouteLinkClickEL.js';
import theDocConfig from '../../OsmGtfsCompare/Interface/DocConfig.js';
import Report from '../../OsmGtfsCompare/Reports/Report.js';

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
	 * A reference to the route links HTMLElement
	 * @type {HTMLElement}
	 */

	#routesLinksdiv = document.getElementById ( 'routesLinks' );

	/**
	 * The route icon that was in the parameters of the last call to the addGpxRoute procedure
	 * @type {String}
	 */

	#lastRouteIcon = '';

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

		const busShortcuts = document.getElementsByClassName ( 'busShortcutAnchor' );
		for ( let counter = 0; counter < busShortcuts.length; counter ++ ) {
			busShortcuts[ counter ].addEventListener ( 'click', new RouteLinkClickEL ( ) );
		}

		// Hidding the animation
		document.getElementById ( 'waitAnimation' ).style.visibility = 'hidden';

	}

	/**
	 * This method open the report (= do some actions at the beginning of the process)
	 */

	open ( ) {

		super.open ( );

		this.#routesLinksdiv = document.createElement ( 'div' );
		this.#routesLinksdiv.id = 'routesLinks';
		this.report.appendChild ( this.#routesLinksdiv );

		// show the animation
		document.getElementById ( 'waitAnimation' ).style.visibility = 'visible';

		// reset of the errorOnly class
		this.report.classList.remove ( 'errorsOnly' );
	}

	/**
	 * This method creates all the needed HTMLElements when an H1HTMLElement is added to the report
	 * @param {Object} osmObject An osmObject linked to the added HTMLElement
	 */

	#createH1HTMLElements ( osmObject ) {

		// adding the osm id to the currentH1Div and currentDataDiv if an OSM object is present
		if ( osmObject ) {
			this.#currentH1Div = document.getElementById ( 'osm' + osmObject.osmIid );
			this.#currentDataDiv = document.getElementById ( 'osm' + osmObject.osmIid + 'DataDiv' );

			const routeLink = document.createElement ( 'span' );
			routeLink.classList.add ( 'busShortcutAnchor' );
			routeLink.innerText = osmObject.ref + ' ';
			routeLink.dataset.routeMasterLinkDiv = 'osm' + osmObject.osmId;
			this.#routesLinksdiv.appendChild ( routeLink );
		}
		else {
			this.#currentH1Div = null;
			this.#currentH2Div = null;
		}

		if ( ! this.#currentH1Div ) {

			// creating the currentH1Div...
			this.#currentH1Div = document.createElement ( 'div' );
			this.report.appendChild ( this.#currentH1Div );
			this.#currentH1Div.appendChild ( this.#currentHTMLElement );

			// and the currentDataDiv
			this.#currentDataDiv = document.createElement ( 'div' );
			this.#currentH1Div.appendChild ( this.#currentDataDiv );
			if ( osmObject ) {
				this.#currentH1Div.id = 'osm' + osmObject.osmId;
				this.#currentDataDiv.id = 'osm' + osmObject.osmId + 'DataDiv';
			}
		}

		// set the currentH2Div to null
		this.#currentH2Div = null;
	}

	/**
	 * This method creates all the needed HTMLElements when an H2HTMLElement is added to the report
	 * @param {Object} osmObject An osmObject linked to the added HTMLElement
	 */

	#createH2HTMLElements ( osmObject ) {

		// adding the osm id to the currentH2Div and currentDataDiv if an OSM object is present
		if ( osmObject ) {
			this.#currentH2Div = document.getElementById ( 'osm' + osmObject.osmId );
			this.#currentDataDiv = document.getElementById ( 'osm' + osmObject.osmId + 'DataDiv' );
		}
		else {
			this.#currentH2Div = null;
		}

		if ( ! this.#currentH2Div ) {

			// creating the currentH2Div...
			this.#currentH2Div = document.createElement ( 'div' );
			this.#currentH1Div.appendChild ( this.#currentH2Div );
			this.#currentH2Div.appendChild ( this.#currentHTMLElement );

			// and the currentDataDiv
			this.#currentDataDiv = document.createElement ( 'div' );
			this.#currentH2Div.appendChild ( this.#currentDataDiv );
			if ( osmObject ) {
				this.#currentH2Div.id = 'osm' + osmObject.osmId;
				this.#currentDataDiv.id = 'osm' + osmObject.osmId + 'DataDiv';
			}
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
		const tmpDate =
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
		const gpxRouteName =
            theDocConfig.vehicle.slice ( 0, 1 ).toUpperCase ( ) + theDocConfig.vehicle.slice ( 1 ) + ' ' +
            routeMaster.ref + ' - from ' + startPlatform.nameOperator +
            ' (' + startPlatform.gtfsRef + ') to ' +
            lastPlatform.nameOperator + ' (' + lastPlatform.gtfsRef + ') - ' +
            route.shapePk + ' - valid from ' + this.#convertDate ( route.startDate ) +
            ' - valid to ' + this.#convertDate ( route.endDate );

		return gpxRouteName;
	}

	/**
	 * Add an HTMLElement to the report and mark this element as warning
	 * @param {String} htmlTag The HTML tag to add (h1, h2, h3 or p)
	 * @param {String} text The text to add in the HTMLElement
	 * @param {Object} osmObject an OSM object to add as a link or a JOSM buton in the HTMLElement
	 */

	addWarning ( htmlTag, text, osmObject ) {
		this.add ( htmlTag, text, osmObject );
		this.#currentHTMLElement.classList.add ( 'isWarning' );
	}

	/**
	 * Add an HTMLElement to the report and mark this element as error
	 * @param {String} htmlTag The HTML tag to add (h1, h2, h3 or p)
	 * @param {String} text The text to add in the HTMLElement
	 * @param {Object} osmObject an OSM object to add as a link or a JOSM buton in the HTMLElement
	 */

	addError ( htmlTag, text, osmObject ) {
		this.add ( htmlTag, text, osmObject );
		this.#currentHTMLElement.classList.add ( 'isError' );
		if ( this.#currentDataDiv ) {
			this.#currentDataDiv.classList.add ( 'haveErrors' );
		}
		if ( this.#currentH2Div ) {
			this.#currentH2Div.classList.add ( 'haveErrors' );
		}
		if ( this.#currentH1Div ) {
			this.#currentH1Div.classList.add ( 'haveErrors' );
		}
	}

	/**
	 * Add an HTMLElement to the report
	 * @param {String} htmlTag The HTML tag to add (h1, h2, h3 or p)
	 * @param {String} text The text to add in the HTMLElement
	 * @param {Object} osmObject an OSM object to add as a link or a JOSM buton in the HTMLElement
	 */

	add ( htmlTag, text, osmObject ) {

		// creation of the HTMLElement
		this.#currentHTMLElement = document.createElement ( htmlTag );

		switch ( htmlTag ) {
		case 'h1' :
			this.#createH1HTMLElements ( osmObject );
			break;
		case 'h2' :
			this.#createH2HTMLElements ( osmObject );
			break;
		case 'h3' :
		case 'p' :
			if ( this.#currentDataDiv ) {
				this.#currentDataDiv.appendChild ( this.#currentHTMLElement );
			}
			break;
		default :
			break;
		}
		this.#currentHTMLElement.innerHTML =
			text +
			this.getOsmLink ( osmObject ) +
			this.getJosmEdit ( osmObject );

	}

	/**
	 * Add the text 'This route is a part of ...'
	 * @param {String} htmlTag The HTML tag to add (h1, h2, h3 or p)
	 * @param {String} text The text to add in the HTMLElement
	 * @param {Object} osmObject an OSM object to add as a link or a JOSM buton in the HTMLElement
	 */

	addPartial ( htmlTag, text, osmObject ) {
		if ( this.#lastRouteIcon.match ( /(🔵|🟡|🔴)(?!(⚪|⚫))/g ) ) {
			this.addError ( htmlTag, text, osmObject );
		}
		else if ( this.#lastRouteIcon.match ( /🟣(?!(⚪|⚫))/g ) ) {
			this.addWarning ( htmlTag, text, osmObject );
		}
		else {
			this.add ( htmlTag, text, osmObject );
		}
	}

	/**
	 * Add a p htmlElement with a gpx download button and the gpx file name
	 * @param {RouteMaster} routeMaster the route master having the route as member
	 * @param {Route} gpxRoute for witch the gpx file must be created
	 * @param {String} routeIcon an icon, depending of the comparison results
	 */

	addGpxRoute ( routeMaster, gpxRoute, routeIcon ) {
		this.#lastRouteIcon = routeIcon;
		const gpxRouteName = this.#getGpxRouteName ( routeMaster, gpxRoute );

		// the route is not ok and not a part of another route and not in the past or the future -> error
		if ( routeIcon.match ( /(🔵|🟡|🔴)(?!(⚪|⚫))/g ) ) {
			this.addError (
				'p',
				routeIcon + ' ' + gpxRouteName + ' ' +
				this.#getGpxDownloadButton ( gpxRoute.shapePk, gpxRouteName )
			);
		}

		// the route is a part of another route but not in the past or thr future -> warning
		else if ( routeIcon.match ( /🟣(?!(⚪|⚫))/g ) ) {
			this.addWarning (
				'p',
				routeIcon + ' ' + gpxRouteName + ' ' +
				this.#getGpxDownloadButton ( gpxRoute.shapePk, gpxRouteName )
			);
		}

		// all other cases
		else {
			this.add (
				'p',
				routeIcon + ' ' + gpxRouteName + ' ' +
				this.#getGpxDownloadButton ( gpxRoute.shapePk, gpxRouteName )
			);
		}
	}

}

/**
 * The one and only one object Report
 * @type {RelationsReport}
 */

const theRelationsReport = new RelationsReport ( );

export default theRelationsReport;

/* --- End of file --------------------------------------------------------------------------------------------------------- */