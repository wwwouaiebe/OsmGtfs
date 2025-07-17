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
Doc reviewed 20250711
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import theDocConfig from '../../OsmGtfsCompare/Interface/DocConfig.js';
import theOperator from '../../Common/Operator.js';
import theOsmRoutesMasterTree from '../../OsmGtfsCompare/DataLoading/OsmRoutesMasterTree.js';
import theOsmPlatforms from '../../OsmGtfsCompare/DataLoading/OsmPlatforms.js';
import ArrayHelper from '../../Common/ArrayHelper.js';
import JsonLoader from '../../Common/JsonLoader.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
 * This class call the overpass-api to obtains the OSM data and load the osm data on the osm route master tree
 * and osm platforms collection
 */
/* ------------------------------------------------------------------------------------------------------------------------- */

class OsmDataLoader {

	/**
	 * An array for the osm route_masters relations
	 * @type {Map.<OsmRouteMaster>}
	 */

	#osmRoutesMaster = new Map ( );

	/**
	 * A js map for the osm route relations. The key of the map objects is the OSM id
	 * @type {Map.<OsmRoute>}
	 */

	#osmRoutes = new Map ( );

	/**
	 * A js map for the osm #osmWays. The key of the map objects is the OSM id
	 * @type {Map.<OsmWay>}
	 */

	#osmWays = new Map ( );

	/**
	 * A js map for the osm nodes. The key of the map objects is the OSM id
	 * @type {Map.<OsmNode>}
	 */

	#osmNodes = new Map ( );

	/**
	 * A js map for the osm platforms. The key of the map objects is the OSM id
	 * @type {Map.<OsmObject>}
	 */

	#osmPlatforms = new Map ( );

	/**
	 * Clear the maps
	 */

	#clear ( ) {
		this.#osmRoutesMaster.clear ( );
		this.#osmNodes.clear ( );
		this.#osmWays.clear ( );
		this.#osmRoutes.clear ( );
		this.#osmPlatforms.clear ( );
	}

	/**
	 * get the first ref:operator given to the platform
	 * @param {OsmObject} osmPlatform
	 * @returns {String} a string with the first ref:operator
	 */

	#getFirstPlatformRef ( osmPlatform ) {
		let platformRefsString = '';
		for ( const network of theOperator.networks ) {
			let platformRefString = osmPlatform?.tags [ 'ref:' + network.osmNetwork ];
			if ( platformRefString ) {
				platformRefsString += platformRefString + ';';
			}
		}
		return platformRefsString.slice ( 0, -1 ).split ( ';' ) [ 0 ];
	}

	/**
	 * Build the RouteMasterTree object for osm
	 */

	#TreeBuilder ( ) {

		/**
		 * An array with the different roles for an osm platform
		 * @type {Array.<String>}
		 */

		const platformRoles = [ 'platform', 'platform_entry_only', 'platform_exit_only' ];

		const routesMaster = [];

		// loop on the osm route master, adding routes master object literal to the route master tree object literal
		this.#osmRoutesMaster.forEach (
			osmRouteMaster => {

				// Building a object literal from the osm route master
				const routeMaster = {
					description : osmRouteMaster?.tags?.description,
					ref : osmRouteMaster?.tags.ref,
					fixme : osmRouteMaster?.tags.fixme,
					operator : osmRouteMaster?.tags?.operator,
					type : [ 'tram', 'subway', 'train', 'bus' ].indexOf ( osmRouteMaster?.tags?.route_master ),
					routes : [],
					osmId : osmRouteMaster.id,
					name : osmRouteMaster?.tags?.name
				};

				// loop on the osm route master members, adding routes
				osmRouteMaster.members.forEach (
					routeMasterMember => {
						const osmRoute = this.#osmRoutes.get ( routeMasterMember.ref );
						if ( osmRoute ) {

							// building a object literal from the osm route
							const route = {
								name : osmRoute?.tags?.name,
								from : osmRoute?.tags?.from,
								to : osmRoute?.tags?.to,
								ref : osmRoute?.tags?.ref,
								fixme : osmRoute?.tags?.fixme,
								operator : osmRoute?.tags?.operator,
								ways : [],
								platforms : [],
								osmId : osmRoute.id
							};

							// loop on the osm route members adding platforms and ways
							// only the refs of the platforms are added to the platforms array
							// Remember that a platform can have multiple refs but only the first ref is added
							osmRoute.members.forEach (
								member => {

									// Adding ways
									if ( '' === member.role ) {
										route.ways.push ( this.#osmWays.get ( member.ref ) );
									}

									// AddingPlatform
									const osmPlatform = this.#osmPlatforms.get ( member.ref );
									if ( osmPlatform && -1 !== platformRoles.indexOf ( member.role )	) {
										route.platforms.push (
											this.#getFirstPlatformRef ( osmPlatform )
										);
									}
								}
							);

							// Adding the route to the route master
							routeMaster.routes.push ( route );
						}
					}
				);

				// sorting routes
				routeMaster.routes.sort (
					( first, second ) => first.name.localeCompare ( second.name )
				);

				// Adding the route master to the tree
				routesMaster.push ( routeMaster );
			}
		);

		theOsmRoutesMasterTree.setJsonRoutesMaster ( routesMaster );
	}

	/**
	* load the data in the maps and array
	* @param {Array} elements An array with the elements part of the overpass-api response
	 */

	#loadOsmData ( elements ) {

		// temp array for platforms
		const tmpOsmPlatforms = [];
		const tmpRoutesMaster = [];
		elements.forEach (
			element => {

				// objects are frozen
				if ( element.tags ) {
					Object.freeze ( element.tags );
				}
				if ( element.members ) {
					Object.freeze ( element.members );
				}
				Object.freeze ( element );

				// Each object is added to collections
				switch ( element.type ) {
				case 'relation' :
					switch ( element.tags.type ) {
					case 'route_master' :
						tmpRoutesMaster.push ( element );
						break;
					case 'route' :
						this.#osmRoutes.set ( element.id, element );
						break;
					default :
						break;
					}
					break;
				case 'way' :
					this.#osmWays.set ( element.id, element );
					break;
				case 'node' :
					this.#osmNodes.set ( element.id, element );
					break;
				default :
					break;
				}
				if ( 'platform' === element?.tags?.public_transport ) {
					tmpOsmPlatforms.push ( element );
				}
			}
		);

		// sorting the platforms and adding to the platform collection
		tmpOsmPlatforms.sort (
			( first, second ) => first?.tags?.name.localeCompare ( second?.tags?.name )
		);
		tmpOsmPlatforms.forEach (
			tmpOsmPlatform => {
				this.#osmPlatforms.set ( tmpOsmPlatform.id, tmpOsmPlatform );
			}
		);

		// sorting the routes master and adding to the routes master collection
		tmpRoutesMaster.sort (
			( first, second ) => ArrayHelper.compareRouteName ( first.tags.ref, second.tags.ref )
		);
		tmpRoutesMaster.forEach (
			tmpRouteMaster => {
				this.#osmRoutesMaster.set ( tmpRouteMaster.id, tmpRouteMaster );
			}
		);
	}

	/**
	 * load data from the dev data
	 * @param {String} uri The uri to use for fetching
	 */

	async #loadDevData ( uri ) {
		console.info ( 'Warning: osm dev data are used' );
		console.info ( uri );

		let devData = await new JsonLoader ( ).loadData (
			'./dataFiles/devData/devData-' + theDocConfig.network.toUpperCase ( ) + '.json'
		);

		return devData.elements;

	}

	/**
	 * fetch data from the overpass-api
	 * @param {String} uri The uri to use for fetching
	 */

	async #fetchOverpassApi ( uri ) {

		// fetch overpass-api
		let elements = null;
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
					elements = jsonResponse.elements;
				}
			)
			.catch (
				err => {
					console.error ( err );
				}
			);

		return elements;
	}

	/**
	 * fetch data from the overpass-api or the dev data
	 */

	async fetchData ( ) {

		this.#clear ( );

		// uri creation
		let uri =
			'https://lz4.overpass-api.de/api/interpreter?data=[out:json][timeout:40];' +
			'rel["network"~"' + theDocConfig.network + '"]' +
			'["route"="' + theDocConfig.vehicle + '"]' +
			'["type"="route"]' +
			( '' === theDocConfig.ref ? '' : '["ref"="' + theDocConfig.ref + '"]' ) +
			'->.rou;(.rou <<; - .rou;); >> ->.rm;.rm out;';

		let elements = null;

		const useDevData = new URL ( window.location ).searchParams.get ( 'devData' );

		if ( useDevData ) {
			elements = await this.#loadDevData ( uri );
		}
		else {
			elements = await this.#fetchOverpassApi ( uri );
		}

		if ( elements ) {
			this.#loadOsmData ( elements );
			this.#TreeBuilder ( );
			theOsmPlatforms.loadData ( this.#osmPlatforms );
		}
	}

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default OsmDataLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */