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

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * A simple container for an osm or gtfs route
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class Route {

	/**
	 * The name of the route (empty for GTFS)
	 * @type {String}
	 */

	#name;

	/**
	 * The from tag of the route (empty for GTFS)
	 * @type {String}
	 */

	#from;

	/**
	 * The to tag of the route (empty for GTFS)
	 * @type {String}
	 */

	#to;

	/**
	 * The ref tag of the route
	 * @type {String}
	 */

	#ref;

	/**
	 * An array with the ref of the platforms used by the route
	 * @type {Array.<String>}
	 */

	#platforms = [];

	/**
	 * A unique identifier for the route (empty for OSM). Equal to the primary key of the route in the gtfs db
	 * @type {String}
	 */

	#shapePk;

	/**
	 * The gtfs start date of the route
	 * @type {String}
	 */

	#startDate;

	/**
	 * The gtfs end date of the route
	 * @type {String}
	 */

	#endDate;

	/**
	 * The coords of the route encoded with PolylineEncoder
	 * @type {String}
	 */

	#nodes;

	/**
	 * The osm ways of the route
	 * @type {OsmWay}
	 */

	#ways = [];

	/**
	 * The osmId of the route
	 * @type {?Number}
	 */

	#osmId;

	/**
	 * The operator of the route
	 * @type {String}
	 */

	#operator;

	/**
	 * The fixme of the route
	 * @type {String}
	 */

	#fixme;

	/**
	 * The note of the route
	 * @type {String}
	 */

	#note;

	/**
	 * The name of the route (empty for GTFS)
	 * @type {String}
	 */

	get name ( ) { return this.#name; }

	/**
	 * The from tag of the route (empty for GTFS)
	 * @type {String}
	 */

	get from ( ) { return this.#from; }

	/**
	 * The to tag of the route (empty for GTFS)
	 * @type {String}
	 */

	get to ( ) { return this.#to; }

	/**
	 * The ref tag value of the route
	 * @type {String}
	 */

	get ref ( ) { return this.#ref; }

	/**
	 * An array with the ref of the platforms used by the route
	 * @type {Array.<String>}
	 */

	get platforms ( ) { return this.#platforms; }

	/**
	 * A unique identifier for the route (empty for OSM). Equal to the primary key of the route in the gtfs db
	 * @type {String}
	 */

	get shapePk ( ) { return this.#shapePk; }

	/**
	 * The gtfs start date of the route
	 * @type {String}
	 */

	get startDate ( ) { return this.#startDate; }

	/**
	 * The gtfs end date of the route
	 * @type {String}
	 */

	get endDate ( ) { return this.#endDate; }

	/**
	 * The coords of the route encoded with PolylineEncoder
	 * @type {String}
	 */

	get nodes ( ) { return this.#nodes; }

	/**
	 * The osm ways of the route
	 * @type {OsmWay}
	 */

	get ways ( ) { return this.#ways; }

	/**
	 * The osmId of the route
	 * @type {?Number}
	 */

	get osmId ( ) { return this.#osmId; }

	/**
	 * The osm type of the route
	 * @type {String}
	 */

	get osmType ( ) { return 'relation'; }

	/**
	 * The operator of the route
	 * @type {String}
	 */

	get operator ( ) { return this.#operator; }

	/**
	 * The fixme of the route master
	 * @type {String}
	 */

	get fixme ( ) { return this.#fixme; }

	/**
	 * The note of the route
	 * @type {String}
	 */

	get note ( ) { return this.#note; }

	/**
	 * An object that can be used by JSON.stringify with all the properties of the route.
	 * @type {Object}
	 */

	get jsonObject ( ) {
		const jsonRoute = {
			name : this.#name,
			from : this.#from,
			to : this.#to,
			ref : this.#ref,
			platforms : [],
			shapePk : this.#shapePk,
			startDate : this. #startDate,
			endDate : this.#endDate,
			nodes : this.#nodes,
			ways : this.#ways,
			osmId : this.#osmId,
			operator : this.#operator,
			fixme : this.#fixme,
			note : this.#note
		};
		this.#platforms.forEach (
			platform => jsonRoute.platforms.push ( platform )
		);
		Object.freeze ( jsonRoute.platforms );
		return Object.freeze ( jsonRoute );
	}

	/**
	 * The constructor
	 * @param {Object} jsonRoute An object litteral with the properties of the route to create
	 */

	constructor ( jsonRoute ) {
		Object.freeze ( this );
		this.#name = jsonRoute.name;
		this.#from = jsonRoute.from;
		this.#to = jsonRoute.to;
		this.#ref = jsonRoute.ref;
		this.#platforms = jsonRoute.platforms;
		this.#shapePk = jsonRoute.shapePk;
		this.#startDate = jsonRoute.startDate;
		this.#endDate = jsonRoute.endDate;
		this.#nodes = jsonRoute.nodes;
		this.#ways = jsonRoute.ways;
		this.#osmId = jsonRoute.osmId;
		this.#operator = jsonRoute.operator;
		this.#fixme = jsonRoute.fixme;
		this.#note = jsonRoute.note;
	}
}

export default Route;

/* --- End of file --------------------------------------------------------------------------------------------------------- */