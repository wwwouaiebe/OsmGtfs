/*
Copyright - 2023 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.1.0:
		- created
 */

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
Navigator for errors in the relations pane
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class ErrorsNavigator {

	/**
	 * An array with the paragraphs containing a 🔵🟡🔴🟣 char
	 * @type {Array.<HTMLElement>}
	 */

	#paragraphs = [];

	/**
	 * A pointer to the current select paragraph
	 * @type {Number}
	 */

	#paragraphPointer = -1;

	/**
	 * The constructor
	 */

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	 * reset the paragraphs after a new search
	 */

	reset ( ) {
		let paragraphs = document.getElementsByTagName ( 'p' );
		this.#paragraphPointer = 0;
		this.#paragraphs.length = 0;
		while ( this.#paragraphPointer < paragraphs.length ) {
			if ( paragraphs.item ( this.#paragraphPointer ).innerText.match ( /(🔵|🟡|🔴|🟣)/g ) ) {
				this.#paragraphs.push ( paragraphs.item ( this.#paragraphPointer ) );
			}
			this.#paragraphPointer ++;
		}
		this.#paragraphPointer = -1;
	}

	/**
	 * navigate to the next error
	 */

	next ( ) {
		if ( 0 === this.#paragraphs.length ) {
			return;
		}
		if ( -1 < this.#paragraphPointer ) {
			this.#paragraphs [ this.#paragraphPointer ].classList.remove ( 'currentError' );
		}
		this.#paragraphPointer ++;
		if ( this.#paragraphPointer === this.#paragraphs.length ) {
			this.#paragraphPointer = 0;
		}
		this.#paragraphs [ this.#paragraphPointer ].classList.add ( 'currentError' );
		this.#paragraphs [ this.#paragraphPointer ].scrollIntoView (
			{ behavior : 'smooth', block : 'start' }
		);
	}

	/**
	 * navigate to the previous error
	 */

	previous ( ) {
		if ( 0 === this.#paragraphs.length ) {
			return;
		}
		if ( -1 < this.#paragraphPointer ) {
			this.#paragraphs [ this.#paragraphPointer ].classList.remove ( 'currentError' );
		}
		this.#paragraphPointer --;
		if ( 0 > this.#paragraphPointer ) {
			this.#paragraphPointer = this.#paragraphs.length - 1;
		}
		this.#paragraphs [ this.#paragraphPointer ].classList.add ( 'currentError' );
		this.#paragraphs [ this.#paragraphPointer ].scrollIntoView (
			{ behavior : 'smooth', block : 'start' }
		);
	}

}

/**
 * The one and only one object ErrorsNavigator
 * @type {ErrorsNavigator}
 */

const theErrorsNavigator = new ErrorsNavigator ( );

export default theErrorsNavigator;

/* --- End of file --------------------------------------------------------------------------------------------------------- */