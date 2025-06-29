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
click on the theme link event listener
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class ClickThemeLinkEL {

	/**
	A reference to the ThemeChanger Object
	@type {ThemeChanger}
	*/

	#themeChanger;

	/**
	The constructor
	@param {ThemeChanger} themeChanger A reference to the ThemeChanger Object
	*/

	constructor ( themeChanger ) {
		Object.freeze ( this );
		this.#themeChanger = themeChanger;
	}

	/**
	Event listener method
	*/

	handleEvent ( ) {
		this.#themeChanger.toggle ( true );
	}
}

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
change of the prefered theme event listener.
Prefered theme can be changed from the browser preferences or os preferences
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class PreferedThemeChangeEL {

	/**
	A reference to the ThemeChanger Object
	@type {ThemeChanger}
	*/

	#themeChanger;

	/**
	The constructor
	@param {ThemeChanger} themeChanger A reference to the ThemeChanger Object
	*/

	constructor ( themeChanger ) {
		Object.freeze ( this );
		this.#themeChanger = themeChanger;
	}

	/**
	Event listener method
	*/

	handleEvent ( ) {
		this.#themeChanger.onPreferedThemeChange ( );
	}

}

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
storage event listener
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class StorageEL {

	/**
	A reference to the ThemeChanger Object
	@type {ThemeChanger}
	*/

	#themeChanger;

	/**
	The constructor
	@param {ThemeChanger} themeChanger A reference to the ThemeChanger Object
	*/

	constructor ( themeChanger ) {
		Object.freeze ( this );
		this.#themeChanger = themeChanger;
	}

	/**
	Event listener method
	*/

	handleEvent ( ) {
		this.#themeChanger.onStorageChange ( );
	}
}

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
ThemeChanger class. Performs the theme changes
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class ThemeChanger {

	/**
    The currently used theme. Must be 'dark' or 'light'
    @type {String}
    */

	#theme;

	/**
    the HTMLElement used to change the theme
    @type {HTMLElement}
    */

	#themeLink;

	/**
    A flag set to true when storage is available ( can be deactived by the user preferences )
    @type {boolean}
    */

	#haveStorage;

	/**
    A simple method to test if the storage is available
    @param {String} type the type of the storage ( 'localStorage' or 'sessionStorage' )
    @return {boolean} true when the storage is available, false otherwise
    */

	#isStorageAvailable ( type ) {
		try {
			const storage = window [ type ];
			const testString = '__storage_test__';
			storage.setItem ( testString, testString );
			storage.removeItem ( testString );
			return true;
		}
		catch {
			return false;
		}
	}

	/**
    Change the theme to the prefered theme
    */

	#changeThemeToPrefered ( ) {

		// Reading the prefered theme
		this.#theme = window.matchMedia ( '(prefers-color-scheme: light)' ).matches ? 'light' : 'dark';

		// Overloading the prefered theme with the stored theme if any
		if ( this.#haveStorage ) {
			this.#theme = localStorage.getItem ( 'preferedTheme' ) || this.#theme;
		}

		// Removing old classes
		document.body.classList.remove ( 'cyDark' );
		document.body.classList.remove ( 'cyLight' );

		// adding new class
		document.body.classList.add ( 'dark' === this.#theme ? 'cyDark' : 'cyLight' );

		// updating the theme link

		if ( 'dark' === this.#theme ) {
			this.#setThemeLinkForDark ( );
		}
		else {
			this.#setThemeLinkForLight ( );
		}
	}

	/**
    Change the theme link for dark
    */

	#setThemeLinkForDark ( ) {
		this.#themeLink.innerText = '☼';
		this.#themeLink.title = 'Apparence: clair';
		this.#themeLink.alt = 'Apparence: clair';
	}

	/**
    Change the theme link for light
    */

	#setThemeLinkForLight ( ) {
		this.#themeLink.innerText = '☽';
		this.#themeLink.title = 'Apparence: sombre';
		this.#themeLink.alt = 'Apparence: sombre';
	}

	/**
    The constructor
    */

	constructor ( ) {
		Object.freeze ( this );

		// adding event listeners on the prefered themes changes
		window.matchMedia ( '(prefers-color-scheme: light)' )
			.addEventListener ( 'change', new PreferedThemeChangeEL ( this ) );
		window.matchMedia ( '(prefers-color-scheme: dark)' )
			.addEventListener ( 'change', new PreferedThemeChangeEL ( this ) );

		// testing the storage
		this.#haveStorage = this.#isStorageAvailable ( 'localStorage' );

		if ( this.#haveStorage ) {
			window.addEventListener ( 'storage', new StorageEL ( this ) );
		}

		// searching the theme link
		this.#themeLink = document.getElementById ( 'cyDarkLight' );

		// adding event listener on the theme link
		if ( this.#themeLink ) {
			this.#themeLink.addEventListener ( 'click', new ClickThemeLinkEL ( this ) );
		}

		// and finally changing theme
		this.#changeThemeToPrefered ( );
	}

	/**
    Event handler for the prefered theme change
    */

	onPreferedThemeChange ( ) {

		// Cleaning the storage
		if ( this.#haveStorage ) {
			localStorage.removeItem ( 'preferedTheme' );
		}

		// and changing the theme
		this.#changeThemeToPrefered ( );
	}

	/**
    Event handler for the storage change. Toggle the theme if needed.
    */

	onStorageChange ( ) {
		const storageTheme = localStorage.getItem ( 'preferedTheme' );
		if ( storageTheme && storageTheme !== this.#theme ) {
			this.toggle ( false );
		}
	}

	/**
    Event handler for the theme link. Toggle the theme
	@param {Boolean} updateStorage A flag indicating that the storage must be updated or not
    */

	toggle ( updateStorage ) {

		// changing theme
		if ( 'dark' === this.#theme ) {
			this.#theme = 'light';
			document.body.classList.remove ( 'cyDark' );
			document.body.classList.add ( 'cyLight' );
			this.#setThemeLinkForLight ( );
		}
		else {
			this.#theme = 'dark';
			document.body.classList.remove ( 'cyLight' );
			document.body.classList.add ( 'cyDark' );
			this.#setThemeLinkForDark ( );
		}

		// saving the theme to the storage
		if ( this.#haveStorage && updateStorage ) {
			localStorage.setItem ( 'preferedTheme', this.#theme );
		}
	}
}

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
The one and only one instance of ThemeChanger class
@type {ThemeChanger}
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

const theThemeChanger = new ThemeChanger;

export default theThemeChanger;

/* --- End of file --------------------------------------------------------------------------------------------------------- */