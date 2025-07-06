import theGtfsRoutesMasterTree from '../DataLoading/GtfsRoutesMasterTree.js';
import theOsmRoutesMasterTree from '../DataLoading/OsmRoutesMasterTree.js';
import theRelationsReport from '../Reports/RelationsReport.js';

class RoutesMasterTreesComparator {

	#missingOsmRoutesMaster = [];
	#unknownOsmRoutesMaster = [];

	#searchRouteMaster ( routeMasterTree, routeMaster, missingRoutesMaster ) {
		let searchedRouteMaster = null;
		let searchedRoutesMaster = routeMasterTree.routesMaster.filter ( element => routeMaster.ref === element.ref );

		switch ( searchedRoutesMaster.length ) {
		case 0 :
			missingRoutesMaster.push ( routeMaster );
			break;
		case 1 :
			searchedRouteMaster = searchedRoutesMaster [ 0 ];
			break;
		default :
			searchedRoutesMaster = routeMasterTree.routesMaster.filter (
				element => {
					let returnValue =
                        routeMaster.ref === element.ref
                        &&
                        element.description
						&&
                        0 === routeMaster.description.toLowerCase ( ).localeCompare (
                        	element.description.toLowerCase ( )
                        );
					return returnValue;
				}
			);
			if ( 1 === searchedRoutesMaster.length ) {
				searchedRouteMaster = searchedRoutesMaster [ 0 ];
			}
			else {
				missingRoutesMaster.push ( routeMaster );
			}
			break;
		}

		return searchedRouteMaster;
	}

	#compareGtfsRoutesMasterTree ( ) {
		theGtfsRoutesMasterTree.routesMaster.forEach (
			gtfsRouteMaster => {
				const osmRouteMaster = this.#searchRouteMaster (
					theOsmRoutesMasterTree,
					gtfsRouteMaster,
					this.#missingOsmRoutesMaster
				);
			}
		);
	}

	#compareOsmRoutesMasterTree ( ) {
		theOsmRoutesMasterTree.routesMaster.forEach (
			osmRouteMaster => {
				const gtfsRouteMaster = this.#searchRouteMaster (
					theGtfsRoutesMasterTree,
					osmRouteMaster,
					this.#unknownOsmRoutesMaster
				);
			}
		);
	}

	#reportMissingOsmRoutesMaster ( ) {
		theRelationsReport.add ( 'h1', 'gtfs routes master without osm routes master' );
		if ( 0 === this.#missingOsmRoutesMaster.length ) {
			theRelationsReport.add ( 'p', 'nothing found' );
		}
		else {
			this.#missingOsmRoutesMaster.forEach (
				gtfsRouteMaster => {
					theRelationsReport.add (
						'h2',
						'gtfs route : ' + gtfsRouteMaster.ref + ' ' + gtfsRouteMaster.description
					);
					gtfsRouteMaster.routes.forEach (
						route => { theRelationsReport.addGpxRoute ( gtfsRouteMaster, route ); }
					);
				}
			);
		}
	}

	#reportUnknownOsmRoutesMaster ( ) {
		theRelationsReport.add ( 'h1', 'Osm routes master not found in the gtfs data' );
		if ( 0 === this.#unknownOsmRoutesMaster ) {
			theRelationsReport.add ( 'p', 'nothing found' );
		}
		else {
			this.#unknownOsmRoutesMaster.forEach (
				unknownOsmRouteMaster => {
					theRelationsReport.add (
						'p',
						unknownOsmRouteMaster.ref + ' ' + unknownOsmRouteMaster.description
					);
				}
			);
		}
	}

	compare ( ) {
		this.#compareGtfsRoutesMasterTree ( );
		this.#compareOsmRoutesMasterTree ( );
		this.#reportMissingOsmRoutesMaster ( );
		this.#reportUnknownOsmRoutesMaster ( );
	}

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default RoutesMasterTreesComparator;