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

import Route from '../Common/Route.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * An object with all the properties needed for the route master comparison OSM GTFS
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class RouteMaster {

	/**
	 * The name of the route master
	 * @type {String}
	 */

	#name;

	/**
	 * The description of the route master.
	 * For gtfs it's the route_long_name field of the table route
	 * For OSM, it's the description tag of the route master
	 * @type {String}
	 */

	#description;

	/**
	 * The ref of the route master.
	 * For gtfs it's the route_short_name field of the table route
	 * For OSM, it's the ref tag of the route master
	 * @type {String}
	 */

	#ref;

	/**
	 * The type of the route master.
	 * It's a flag indicating the vehicle used on the route master (0 = tram, 3 = bus)
	 * @type {Number}
	 */

	#type;

	/**
	 * An array of Route objects with the routes linked to the route master
	 * @type {Array.<Route>}
	 */

	#routes = [];

	/**
	 * The osmId of the route master
	 * @type {?Number}
	 */

	#osmId;

	/**
	 * The operator of the route master
	 * @type {String}
	 */

	#operator;

	/**
	 * The fixme of the route master
	 * @type {String}
	 */

	#fixme;

	/**
	 * The name of the route master
	 * @type {String}
	 */

	get name ( ) { return this.#name; }

	/**
	 * The description of the route master.
	 * For gtfs it's the route_long_name field of the table route
	 * For OSM, it's the description tag of the route master
	 * @type {String}
	 */

	get description ( ) { return this.#description; }

	/**
	 * The ref of the route master.
	 * For gtfs it's the route_short_name field of the table route
	 * For OSM, it's the ref tag of the route master
	 * @type {String}
	 */

	get ref ( ) { return this.#ref; }

	/**
	 * The type of the route master.
	 * It's a flag indicating the vehicle used on the route master (0 = tram, 3 = bus)
	 * @type {Number}
	 */

	get type ( ) { return this.#type; }

	/**
	 * An array of Route objects with the routes linked to the route master
	 * @type {Array.<Route>}
	 */

	get routes ( ) { return this.#routes; }

	/**
	 * The osmId of the route master
	 * @type {?Number}
	 */

	get osmId ( ) { return this.#osmId; }

	/**
	 * The osm type of the route master
	 * @type {String}
	 */

	get osmType ( ) { return 'relation'; }

	/**
	 * The operator of the route master
	 * @type {String}
	 */

	get operator ( ) { return this.#operator; }

	/**
	 * The fixme of the route master
	 * @type {String}
	 */

	get fixme ( ) { return this.#fixme; }

	/**
	 * An object that can be used by JSON.stringify with all the properties of the route master.
	 * @type {Object}
	 */

	get jsonObject ( ) {
		const jsonRouteMaster = {
			description : this.#description,
			ref : this.#ref,
			type : this.#type,
			routes : [],
			osmId : this.#osmId,
			operator : this.#operator,
			fixme : this.#fixme,
			name : this.#name
		};
		this.#routes.forEach (
			route => {
				jsonRouteMaster.routes.push ( route.jsonObject );
			}
		);
		Object.freeze ( jsonRouteMaster.routes );

		return Object.freeze ( jsonRouteMaster );
	}

	/**
	 * The constructor
	 * @param {Object} jsonRouteMaster An object litteral with the properties of the route master to create
	 */

	constructor ( jsonRouteMaster ) {
		Object.freeze ( this );
		this.#description = jsonRouteMaster.description;
		this.#ref = jsonRouteMaster.ref;
		this.#type = Number.parseInt ( jsonRouteMaster.type );
		this.#routes = [];
		for ( const jsonRoute of jsonRouteMaster.routes ) {
			this.routes.push ( new Route ( jsonRoute ) );
		}
		this.#osmId = jsonRouteMaster.osmId;
		this.#operator = jsonRouteMaster.operator;
		this.#fixme = jsonRouteMaster.fixme;
		this.#name = jsonRouteMaster.name;
	}
}

export default RouteMaster;

/* --- End of file --------------------------------------------------------------------------------------------------------- */