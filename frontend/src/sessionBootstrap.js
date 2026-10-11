// Imported first in main.js: stores a Steam sign-in session from the URL
// fragment and removes it from the address bar before the router reads the
// URL, so the token never lingers in history or shared links.
import { captureSessionFromHash } from './searchApi'

captureSessionFromHash()
