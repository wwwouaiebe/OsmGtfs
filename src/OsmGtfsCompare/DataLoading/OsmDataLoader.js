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

import theDocConfig from '../../OsmGtfsCompare/interface/DocConfig.js';
import theOsmRoutesMasterTree from '../../OsmGtfsCompare/DataLoading/OsmRoutesMasterTree.js';
import theOsmPlatforms from '../../OsmGtfsCompare/DataLoading/OsmPlatforms.js';
import ArrayHelper from '../../Common/ArrayHelper.js';
import theOperator from '../../Common/Operator.js';

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

	#osmRoutesMaster = [];

	/**
	 * A js map for the osm route relations. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	#osmRoutes = new Map ( );

	/**
	 * A js map for the osm #osmWays. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	#osmWays = new Map ( );

	/**
	 * A js map for the osm nodes. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	#osmNodes = new Map ( );

	/**
	 * A js map for the osm platforms. The key of the map objects is the OSM id
	 * @type {Map}
	 */

	#osmPlatforms = new Map ( );

	/**
	 * An array with the different roles for an osm platform
	 * @type {Array.<String>}
	 */

	#platformRoles = [ 'platform', 'platform_entry_only', 'platform_exit_only' ];

	/**
	 * Clear maps and array.
	 */

	#clear ( ) {
		this.#osmRoutesMaster = [];
		this.#osmNodes.clear ( );
		this.#osmWays.clear ( );
		this.#osmRoutes.clear ( );
		this.#osmPlatforms.clear ( );
	}

	/**
	 * Get the osm object ( = the object given by overpass) corresponding to a route master
	 * @param {Number} osmId the osm id of the osm object
	 * @returns {Object} The searched osm route master
	 */

	getRouteMaster ( osmId ) {
		return ( this.#osmRoutesMaster.find ( element => element.id === osmId ) );
	}

	/**
	 * Get the osm object ( = the object given by overpass) corresponding to a route
	 * @param {Number} osmId the osm id of the osm object
	 * @returns {Object} The searched osm route
	 */

	getRoute ( osmId ) {
		return this.#osmRoutes.get ( osmId );
	}

	/**
	 * get a string with all the ref:operator given to the platform
	 * @param {Object} osmPlatform
	 * @returns {String} a string with all the platforms ref:operator (csv format)
	 */

	#getOperatorPlatformRef ( osmPlatform ) {
		let platformRefs = '';
		for ( const network of theOperator.networks ) {
			let platformRef = osmPlatform?.tags [ 'ref:' + network.osmNetwork ];
			if ( platformRef ) {
				platformRefs += platformRef.split ( ';' ) [ 0 ] + ';';
			}
		}
		return platformRefs.slice ( 0, -1 );
	}

	/**
	 * Build the RouteMasterTree object for osm
	 */

	#TreeBuilder ( ) {
		const routesMasterTree = {
			routesMaster : []
		};
		this.#osmRoutesMaster.forEach (
			osmRouteMaster => {
				let routeMaster = {
					description : osmRouteMaster?.tags?.description,
					ref : osmRouteMaster?.tags.ref,
					type : [ 'tram', 'subway', 'train', 'bus' ].indexOf ( osmRouteMaster?.tags?.route_master ),
					routes : [],
					osmId : osmRouteMaster.id,
					operator : osmRouteMaster?.tags?.operator
				};
				osmRouteMaster.members.forEach (
					routeMasterMember => {
						const osmRoute = this.#osmRoutes.get ( routeMasterMember.ref );
						if ( osmRoute ) {
							let route = {
								name : osmRoute?.tags?.name,
								from : osmRoute?.tags?.from,
								to : osmRoute?.tags?.to,
								platforms : [],
								shapePk : null,
								startDate : null,
								endDate : null,
								nodes : null,
								osmId : osmRoute.id
							};
							osmRoute.members.forEach (
								routeMember => {
									const osmPlatform = this.#osmPlatforms.get ( routeMember.ref );
									if ( osmPlatform && -1 !== this.#platformRoles.indexOf ( routeMember.role )	) {

										// route.platforms.push ( this.#getOperatorPlatformRef ( osmPlatform ) );
										route.platforms.push (
											this.#getOperatorPlatformRef ( osmPlatform ).split ( ';' ) [ 0 ]
										);
									}
								}
							);
							routeMaster.routes.push ( route );
						}
					}
				);
				routeMaster.routes.sort (
					( first, second ) => first.name.localeCompare ( second.name )
				);
				routesMasterTree.routesMaster.push ( routeMaster );
			}
		);

		theOsmRoutesMasterTree.buildFromJson ( routesMasterTree );
	}

	/**
	* load the data in the maps and array
	* @param {Array} elements An array with the elements part of the overpass-api response
	 */

	#loadOsmData ( elements ) {
		const tmpOsmPlatforms = [];
		elements.forEach (
			element => {
				switch ( element.type ) {
				case 'relation' :
					switch ( element.tags.type ) {
					case 'route_master' :
						Object.freeze ( element );
						this.#osmRoutesMaster.push ( element );
						break;
					case 'route' :
						Object.freeze ( element );
						this.#osmRoutes.set ( element.id, element );
						break;
					default :
						break;
					}
					break;
				case 'way' :
					Object.freeze ( element );
					this.#osmWays.set ( element.id, element );
					break;
				case 'node' :
					Object.freeze ( element );
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

		tmpOsmPlatforms.sort (
			( first, second ) => first?.tags?.name.localeCompare ( second?.tags?.name )
		);
		tmpOsmPlatforms.forEach (
			tmpOsmPlatform => {
				this.#osmPlatforms.set ( tmpOsmPlatform.id, tmpOsmPlatform );
			}
		);

		this.#osmRoutesMaster.sort (
			( first, second ) => ArrayHelper.compareRouteName ( first.tags.ref, second.tags.ref )
		 );
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
				'../../../devData/devData-' + theDocConfig.network.toUpperCase ( ) + '.json',
				{ with : { type : 'json' } }
			);
			return osmData.elements;
		}
		catch {
			return null;
		}

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

/**
 * The one and only one object OsmDataLoader
 */

const theOsmDataLoader = new OsmDataLoader ( );

export default theOsmDataLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */