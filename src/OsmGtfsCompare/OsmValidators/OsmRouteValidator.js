import theRelationsReport from '../Reports/RelationsReport.js';

class OsmRouteValidator {

	#route;

	validate ( route ) {
		this.#route = route;
		theRelationsReport.add ( 'h3', 'Validation of tags, roles and members for route' );
	}

	constructor ( ) {
		Object.freeze ( this );
	}
}

export default OsmRouteValidator;