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

import GpxFactory from '../OsmGtfsCompare/GpxFactory.js';
import { theGtfsTree } from './DataTree.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Simple event handler for click on the Download gpx
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class GpxButtonClickEL {

	/**
	 * Search a route identified by the unique identifier in the GTFS data
	 * @param {String} shapePk The unique identifier if the route given by mySql
	 */

	#getRouteFromShapePk ( shapePk ) {

		// parsing to number because data in the button dataset are always string
		const iShapePk = Number.parseInt ( shapePk );
		let returnRoute = null;
		theGtfsTree.routesMaster.forEach (
			routeMaster => {
				routeMaster.routes.forEach (
					route => {
						if ( route.shapePk === iShapePk ) {
							returnRoute = route;
						}
					}
				);
			}
		);
		return returnRoute;
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * Click event listener
	 * @param {Event} clickEvent the click event
	 */

	handleEvent ( clickEvent ) {

		// set the button as visited
		clickEvent.target.classList.add ( 'gpxButtonVisited' );

		// Building the gtfs file
		new GpxFactory ( ).buildGpx ( this.#getRouteFromShapePk ( clickEvent.target.dataset.shapePk ) );
	}
}

export default GpxButtonClickEL;

/* --- End of file --------------------------------------------------------------------------------------------------------- */