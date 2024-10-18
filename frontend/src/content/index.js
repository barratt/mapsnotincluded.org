import enNotFound from './en/view/not_found.js'
import enAbout from './en/view/about.js'
import enContribute from './en/view/contribute.js'
import enHome from './en/view/home.js'
import enMapExplorerSteps from './en/view/map_explorer_steps.js'
import enMapExplorer from './en/view/map_explorer.js'
import enWorldTraitFinder from './en/view/world_trait_finder.js/index.js'

import koKRNotFound from './ko-KR/view/not_found.js'
import koKRAbout from './ko-KR/view/about.js'
import koKRContribute from './ko-KR/view/contribute.js'
import koKRHome from './ko-KR/view/home.js'
import koKRMapExplorerSteps from './ko-KR/view/map_explorer_steps.js'
import koKRMapExplorer from './ko-KR/view/map_explorer.js'
import koKRWorldTraitFinder from './ko-KR/view/world_trait_finder.js'

// Create a merged messages object
const messages = {
  en: {
    not_found: enNotFound,
    about: enAbout,
    contribute: enContribute,
    home: enHome,
    mapExplorerSteps: enMapExplorerSteps,
    mapExplorer: enMapExplorer,
    worldTraitFinder: enWorldTraitFinder,
  },
  kr: {
    not_found: koKRNotFound,
    about: koKRAbout,
    contribute: koKRContribute,
    home: koKRHome,
    mapExplorerSteps: koKRMapExplorerSteps,
    mapExplorer: koKRMapExplorer,
    worldTraitFinder: koKRWorldTraitFinder,
  }
};

// Export the messages object
export default messages;