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
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * Coming soon
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class Platform {

	/**
	 * The gtfs type of the platform. See gtfs doc
	 * @type {Number}
	 */

	#type;

	/**
	 * The gtfs type of the platform. See gtfs doc
	 * @type {Number}
	 */

	get type ( ) { return this.#type; }

	/**
	 * The fixme of the platform if any
	 * @type {String}
	 */

	#fixme;

	/**
	 * The fixme of the platform if any
	 * @type {String}
	 */

	get fixme ( ) { return this.#fixme; }

	/**
	 * The lat of the platform
	 * @type {Number}
	 */

	#lat;

	/**
	 * The lat of the platform
	 * @type {Number}
	 */

	get lat ( ) { return this.#lat; }

	/**
	 * The lon of the platform
	 * @type {Number}
	 */

	#lon;

	/**
	 * The lon of the platform
	 * @type {Number}
	 */

	get lon ( ) { return this.#lon; }

	/**
	 * The name of the platform
	 * @type {String}
	 */

	#name;

	/**
	 * The name of the platform
	 * @type {String}
	 */

	get name ( ) { return this.#name; }

	/**
	 * The name:operator of the platform
	 * @type {String}
	 */

	#nameOperator;

	/**
	 * The name:operator of the platform
	 * @type {String}
	 */

	get nameOperator ( ) { return this.#nameOperator; }

	/**
	 * The network of the platform
	 * @type {String}
	 */

	#network;

	/**
	 * The network of the platform
	 * @type {String}
	 */

	get network ( ) { return this.#network; }

	/**
	 * The operator of the platform
	 * @type {String}
	 */

	#operator;

	/**
	 * The operator of the platform
	 * @type {String}
	 */

	get operator ( ) { return this.#operator; }

	/**
	 * The ref of the platform
	 * @type {String}
	 */

	#gtfsRef;

	/**
	 * The ref of the platform
	 * @type {String}
	 */

	get gtfsRef ( ) { return this.#gtfsRef; }

	/**
	 * The refs of the platform (osm: a platform can have multiple refs)
	 * @type {Array.<String>}
	 */

	#osmRefs;

	/**
	 * The refs of the platform (osm: a platform can have multiple refs)
	 * @type {Array.<String>}
	 */

	get osmRefs ( ) { return this.#osmRefs; }

	/**
	 * the route_ref of the platform
	 * It's an object!
	 * @type {Object}
	 */

	#routeRefs;

	/**
	 * the route_ref of the platform
	 * It's an object!
	 * @type {Object}
	 */

	get routeRefs ( ) { return this.#routeRefs; }

	/**
	 * the zone of the platform
	 * @type {string}
	 */

	#zone;

	/**
	 * the zone of the platform
	 * @type {string}
	 */

	get zone ( ) { return this.#zone; }

	/**
	 * The osm id of the platform
	 * @type {Number}
	 */

	#osmId;

	/**
	 * The osm id of the platform
	 * @type {Number}
	 */

	get osmId ( ) { return this.#osmId; }

	/**
	 * The osm type ( node, way, relation)
	 * @type {String}
	 */

	#osmType;

	/**
	 * The osm type ( node, way, relation)
	 * @type {String}
	 */

	get osmType ( ) { return this.#osmType; }

	/**
	 * the constructor
	 * @param {Object} platformProperties An onject with the properties to change
	 */

	constructor ( platformProperties ) {
		this.#type = platformProperties.type;
		this.#fixme = platformProperties.fixme;
		this.#lat = platformProperties.lat;
		this.#lon = platformProperties.lon;
		this.#name = platformProperties.name;
		this.#nameOperator = platformProperties.nameOperator;
		this.#network = platformProperties.network;
		this.#operator = platformProperties.operator;
		this.#gtfsRef = platformProperties.gtfsRef;
		this.#osmRefs = platformProperties.osmRefs;
		this.#routeRefs = platformProperties.routeRefs;
		this.#zone = platformProperties.zone;
		this.#osmId = platformProperties.osmId;
		this.#osmType = platformProperties.osmType;
		Object.freeze ( this );
	}
}

export default Platform;

/* --- End of file --------------------------------------------------------------------------------------------------------- */