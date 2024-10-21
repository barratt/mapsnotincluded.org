import notFound from './view/not_found.js'
import about from './view/about.js'
import contribute from './view/contribute.js'
import home from './view/home.js'
import mapExplorerSteps from './view/map_explorer_steps.js'
import mapExplorer from './view/map_explorer.js'
import worldTraitFinder from './view/world_trait_finder.js'
import seedViewer from './view/seed_viewer.js'
import starmapGenerator from './view/starmap_generator.js'
import navbar from './components/navbar.js'

export default {
  navbar: navbar,
  not_found: notFound,
  about: about,
  contribute: contribute,
  home: home,
  seed_viewer: seedViewer,
  map_explorer_steps: mapExplorerSteps,
  map_explorer: mapExplorer,
  world_trait_finder: worldTraitFinder,
  starmap_generator: starmapGenerator,
}