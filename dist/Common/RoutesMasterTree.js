/*
Copyright - 2025 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import RouteMaster from '../Common/RouteMaster.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RoutesMasterTree {

	/**
	 * An array with the RouteMaster
	 * @type {Array.<RouteMaster>}
	 */

	#routesMaster = [];

	/**
	 * An array with the RouteMaster
	 * @type {Array.<RouteMaster>}
	 */

	get routesMaster ( ) { return this.#routesMaster; };

	/**
	 * An object that can be used by JSON.stringify with all the routes master of the network.
	 * @type {Object}
	 */

	get jsonObject ( ) {
		const jsonRoutesMasterTree = { routesMaster : [] };
		this.#routesMaster.forEach (
			routeMaster => {
				jsonRoutesMasterTree.routesMaster.push ( routeMaster.jsonObject );
			}
		);
		Object.freeze ( jsonRoutesMasterTree.routesMaster );

		return Object.freeze ( jsonRoutesMasterTree );
	}

	/** Set the routes master of the RoutesMasterTree
	 * @param {Array.<Object>} jsonRoutesMaster an Array of object litterals with the routes master properties
	 * @param {Number} gtfsType A gtfs type used to filter the routes master
	 */

	setJsonRoutesMaster ( jsonRoutesMaster, gtfsType ) {
		this.#routesMaster = [];
		for ( const jsonRouteMaster of jsonRoutesMaster ) {
			if ( ! gtfsType || jsonRouteMaster.type === gtfsType ) {
				this.#routesMaster.push ( new RouteMaster ( jsonRouteMaster ) );
			}
		}
	}

	/** Set the routes master of the RoutesMasterTree
	 * @param {Array.<RouteMaster>} routesMaster an Array of RouteMaster objects
	 */

	setRoutesMaster ( routesMaster ) {
		this.#routesMaster = routesMaster;
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

}

export default RoutesMasterTree;

/* --- End of file --------------------------------------------------------------------------------------------------------- */