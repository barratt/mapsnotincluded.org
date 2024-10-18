import en404 from './en/view/404.json'
import enAbout from './en/view/about.json'
import enContribute from './en/view/contribute.json'
import enHome from './en/view/home.json'
import enMapExplorerSteps from './en/view/map_explorer_steps.json'
import enMapExplorer from './en/view/map_explorer.json'
import enWorldTraitFinder from './en/view/world_trait_finder.json'

import koKR404 from './ko-KR/view/404.json'
import koKRAbout from './ko-KR/view/about.json'
import koKRContribute from './ko-KR/view/contribute.json'
import koKRHome from './ko-KR/view/home.json'
import koKRMapExplorerSteps from './ko-KR/view/map_explorer_steps.json'
import koKRMapExplorer from './ko-KR/view/map_explorer.json'
import koKRWorldTraitFinder from './ko-KR/view/world_trait_finder.json'

// Create a merged messages object
const messages = {
  en: {
    404: en404,
    about: enAbout,
    contribute: enContribute,
    home: enHome,
    mapExplorerSteps: enMapExplorerSteps,
    mapExplorer: enMapExplorer,
    worldTraitFinder: enWorldTraitFinder,
  },
  kr: {
    404: en404,
    about: enAbout,
    contribute: enContribute,
    home: enHome,
    mapExplorerSteps: enMapExplorerSteps,
    mapExplorer: enMapExplorer,
    worldTraitFinder: enWorldTraitFinder,
  }
};

// Export the messages object
export default messages;