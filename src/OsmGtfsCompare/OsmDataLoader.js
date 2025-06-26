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

import theDocConfig from '../OsmGtfsCompare/DocConfig.js';
import ArrayHelper from '../Common/ArrayHelper.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * This class call the overpass-api to obtains the OSM data
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmDataLoader {

	/**
	 * An array for the osm route_masters relations
	 * @type {Array.<Object>}
	 */

	routeMasters = [];

	/**
	 * A js map for the osm route relations. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	routes = new Map ( );

	/**
	 * A js map for the osm ways. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	ways = new Map ( );

	/**
	 * A js map for the osm nodes. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	nodes = new Map ( );

	/**
	 * Clear maps and array.
	 */

	#clear ( ) {
		this.routeMasters.splice ( 0 );
		this.nodes.clear ( );
		this.ways.clear ( );
		this.routes.clear ( );
	}

	/**
	 * Sort the route masters
	 */

	#sortRoutesMaster ( ) {
		this.routeMasters.sort (
			( first, second ) => {
				ArrayHelper.compareRouteName ( first.tags.ref, second.tags.ref );
			}
		 );
	}

	/**
	* load the data in the maps and array
	* @param {Array} elements An array with the elements part of the overpass-api response
	 */

	#loadOsmData ( elements ) {
		console.log ( elements );
		elements.forEach (
			element => {
				switch ( element.type ) {
				case 'relation' :
					switch ( element.tags.type ) {
					case 'route_master' :
					case 'proposed:route_master' :
					case 'disused:route_master' :
						Object.freeze ( element );
						this.routeMasters.push ( element );
						break;
					case 'route' :
					case 'proposed:route' :
					case 'disused:route' :
						Object.freeze ( element );
						this.routes.set ( element.id, element );
						break;
					default :
						break;
					}
					break;
				case 'way' :
					Object.freeze ( element );
					this.ways.set ( element.id, element );
					break;
				case 'node' :
					Object.freeze ( element );
					this.nodes.set ( element.id, element );
					break;
				default :
					break;
				}
			}
		);
		this.#sortRoutesMaster ( );
	}

	/**
	 * fetch data from the overpass-api or the dev data
	 * @param {String} uri The uri to use for fetching
	 */

	async #loadDevData ( uri ) {
		console.info ( 'Warning: osm dev data are used' );
		console.info ( uri );

		try {
			const { default : osmData } = await import (
				'../../devData/devData-' + theDocConfig.network.toUpperCase ( ) + '.json',
				{ with : { type : 'json' } }
			);
			this.#loadOsmData ( osmData.elements );

			return true;
		}
		catch {
			return false;
		}

	}

	/**
	 * fetch data from the overpass-api
	 * @param {String} uri The uri to use for fetching
	 */

	async #fetchOverpassApi ( uri ) {

		// fetch overpass-api
		let success = false;
		await fetch ( uri )
			.then (
				response => {
					if ( response.ok ) {
						return response.json ( );
					}
					console.error ( String ( response.status ) + ' ' + response.statusText );
				}
			)
			.then (
				jsonResponse => {

					this.#loadOsmData ( jsonResponse.elements );

					success = true;
				}
			)
			.catch (
				err => {
					console.error ( err );
				}
			);

		return success;
	}

	/**
	 * fetch data from the overpass-api or the dev data
	 */

	async fetchData ( ) {

		this.#clear ( );

		const useDevData = new URL ( window.location ).searchParams.get ( 'devData' );

		// uri creation
		let uri =
			'https://lz4.overpass-api.de/api/interpreter?data=[out:json][timeout:40];' +
			'rel["network"~"' + theDocConfig.network + '"]' +
			'["' + ( 'used' === theDocConfig.type ? '' : theDocConfig.type + ':' ) + 'route"="' + theDocConfig.vehicle + '"]' +
			'["type"="' + ( 'used' === theDocConfig.type ? '' : theDocConfig.type + ':' ) + 'route"]' +
			( '' === theDocConfig.ref ? '' : '["ref"="' + theDocConfig.ref + '"]' ) +
			'->.rou;(.rou <<; - .rou;); >> ->.rm;.rm out;';

		if ( useDevData ) {
			return await this.#loadDevData ( uri );
		}

		return await this.#fetchOverpassApi ( uri );

	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

/**
 * The one and only one object OsmDataLoader
 */

const theOsmDataLoader = new OsmDataLoader ( );

export default theOsmDataLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */