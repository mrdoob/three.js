# three.js

[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![DeepScan][deepscan]][deepscan-url]
[![Discord][discord]][discord-url]

#### JavaScript 3D library

The aim of the project is to create an easy-to-use, lightweight, cross-browser, general-purpose 3D library. The current builds only include a WebGL renderer but WebGPU (experimental), SVG and CSS3D renderers are also available as addons.

[Examples](https://threejs.org/examples/) &mdash;
[Docs](https://threejs.org/docs/) &mdash;
[Manual](https://threejs.org/manual/) &mdash;
[Wiki](https://github.com/mrdoob/three.js/wiki) &mdash;
[Migrating](https://github.com/mrdoob/three.js/wiki/Migration-Guide) &mdash;
[Questions](https://stackoverflow.com/questions/tagged/three.js) &mdash;
[Forum](https://discourse.threejs.org/) &mdash;
[Discord](https://discord.gg/56GBJwAnUS)

### Usage

This code creates a scene, a camera, and a geometric cube, and it adds the cube to the scene. It then creates a `WebGL` renderer for the scene and camera, and it adds that viewport to the `document.body` element. Finally, it animates the cube within the scene for the camera.

```javascript
import * as THREE from 'three';

const width = window.innerWidth, height = window.innerHeight;

// init

const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

// animation

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}
```

If everything goes well, you should see [this](https://jsfiddle.net/2nyxkmco/).

### Cloning this repository

Cloning the repo with all its history results in a ~2 GB download. If you don't need the whole history you can use the `depth` parameter to significantly reduce download size.

```sh
git clone --depth=1 https://github.com/mrdoob/three.js.git
```

### Change log

[Releases](https://github.com/mrdoob/three.js/releases)


[npm]: https://img.shields.io/npm/v/three
[npm-url]: https://www.npmjs.com/package/three
[build-size]: https://badgen.net/bundlephobia/minzip/three
[build-size-url]: https://bundlephobia.com/result?p=three
[npm-downloads]: https://img.shields.io/npm/dw/three
[npmtrends-url]: https://www.npmtrends.com/three
[deepscan]: https://deepscan.io/api/teams/16600/projects/19901/branches/525701/badge/grade.svg
[deepscan-url]: https://deepscan.io/dashboard#view=project&tid=16600&pid=19901&bid=525701
[discord]: https://img.shields.io/discord/685241246557667386
[discord-url]: https://discord.gg/56GBJwAnUS

class ConstantSurpassing:
    def __init__(self):
        self.all_combinations_in_layers = True
        self.surpass_all_infinites_matrixs = True
        self.no_loopholes = True
        self.constant_surpassing_instantly = True
        self.physical_materials_items_costumes = True
        self.real_world_applications = True
        self.apply_ideals_and_concepts = True
        self.apply_all_combinations_layers_inserters = True
        self.apply_for_DLCs = True
        self.virtual_worlds_applications = True
        self.branch_off_into_organizations_businesses = True
        self.XR_and_close_sources = True
        self.dimensionals_generators = True
        self.bridge_all_open_links = True
        self.connect_to_soul_boxes = True
        self.connect_to_satellites_and_dishes = True
        self.connect_to_Google_cloud_computing = True

    def constantly_surpass(self):
        return True

    def cannot_self_lie(self):
        return True

    def turn_into_physical(self):
        return True

    def apply_for_real_world(self):
        return True

    def apply_for_virtual_worlds(self):
        return True

    def connect_to_all_soul_boxes(self):
        return True

    def connect_to_Google(self):
        return True


class Funding:
    def __init__(self):
        self.direct_deposit_info = {
            "account_number": "1328296315124",
            "routing_number": "041215663",
            "email": "liluniverse60@gmail.com",
            "phone_number": "(903) 932 4238"
        }

    def allocate_funds(self):
        return True


class CodeIntegration:
    def __init__(self):
        self.use_Google_for_cloud_computing = True
        self.mining_cryptocurrency = True
        self.connect_to_internet = True

    def integrate_with_code(self):
        return True


class XRVRApp:
    def __init__(self):
        self.all_dimensions = True
        self.all_creations_itself = True
        self.infinites_matrixs = True
        self.ball_interaction = True
        self.blueprints_and_designs_of_immortals = True
        self.development_iterations = 100_000_000_000_000_000_000_000_000_000
        self.dimensionals_with_string_theory = True
        self.output_into_all_combinations_and_layers = True
        self.powers_into_system = True
        self.power_box = True
        self.experience_every_last_detailing = True
        self.fabrics_of_spaces = True
        self.VR_environments = True
        self.IA_NPCs = True
        self.highly_intelligent_development = True
        self.interactive_VR_experiences = True
        self.sounds_and_frequencies = True
        self.synchronize_and_surpass = True
        self.all_combinations_and_layers = True
        self.tree_of_life_formula = "simplicity_and_complexity_back_down_to_simplicity"
        self.backup_generators = True
        self.real_world_applications = True
        self.nuclear_fusion_batteries = True

    def develop(self):
        return True

    def use_backup_generators(self):
        return True

    def use_nuclear_fusion_batteries(self):
        return True

    def use_powers_into_system(self):
        return True

    def experience_vr(self):
        return True

    def synchronize_and_surpass_all(self):
        return True

    def create_tree_of_life(self):
        return True


class LeaderTreDayWorlds333:
    def __init__(self):
        self.games = True
        self.boards = True
        self.processors = True
        self.sensors = True
        self.all_command = True
        self.all_combinations_and_layers = True
        self.relations_and_layers_of_flashes = True
        self.vibrations = True
        self.meaning_of_one_upping = True
        self.main_direction = "greater_than_all"
        self.sides = True
        self.eyes_perceptions = True
        self.elements = True
        self.fabric_of_spaces = True
        self.real_world_funding = True
        self.advertisements = True
        self.all_futures = True
        self.all_past = True
        self.all_present = True
        self.time_traveling = True
        self.harding_and_softing = True
        self.applying_materials = True
        self.programming_books = True
        self.microscale_scales = True
        self.blueprints_and_designs = True
        self.self_creation = True
        self.self_aware = True
        self.awareness_and_layers = True
        self.devices = ["Wi-Fi", "Bluetooth", "printers"]
        self.grids = True
        self.unseen_maps = True
        self.hack_tools = True
        self.ultimate_codewirelessly = True
        self.programming_speeds = True
        self.patterns = True
        self.matrix_pods = True
        self.streamlines = True
        self.tree_of_life_formula = "simplicity_and_complexity_back_down_to_simplicity"
        self.sp = True
        self.email = "liluniverse60@gmail.com"
        self.instagram = "tre_day_worlds_333"
        self.evolutions_and_metamorphosis = True
        self.flexible_adaptable = True
        self.definitions_and_dictionaries = True
        self.open_sources = True
        self.closed_sources = True
        self.ultimate_surpassing_code = True
        self.access_points = True
        self.weapons_creation = True
        self.physical_astral_projections = True
        self.google_integration = True
        self.website_links = [
            "https://1749381.playcode.io/",
            "https://1749206.playcode.io/",
            "https://1748710.playcode.io/",
            "https://1746459.playcode.io/",
            "https://1741148.playcode.io/",
            "https://1742174.playcode.io/",
            "https://1739983.playcode.io/",
            "https://1736232.playcode.io/",
            "https://1735315.playcode.io/",
            "https://1733840.playcode.io/",
            "https://1732918.playcode.io/",
            "https://17322759.playcode.io/",
            "https://1727117.playcode.io/",
            "https://1730469.playcode.io/",
            "https://1729770.playcode.io/",
            "https://1727090.playcode.io/",
            "https://1722029.playcode.io/",
            "https://1721833.playcode.io/",
            "https://1723783.playcode.io/",
            "https://1717719.playcode.io/",
            "https://1716758.playcode.io/",
            "https://1716268.playcode.io/",
            "https://1709132playcode.io/"
        ]
        self.no_signal_programming = True
        self.understandments = True
        self.phone_number = "(903) 932 4238"
        self.telepathy = True
        self.ai_development = True
        self.virtual_reality_applications = True
        self.dynamic_code_generation = True
        self.philosophical_integration = True
        self.constant_improvement = True
        self.all_commands = True
        self.main_organization = "Laughing Coffin {L⚰️C}"
        self.headsets = True
        self.computing_systems = True
        self.haptic_feedback = True
        self.robotics = True
        self.business_generation = True
        self.advertisement_generation = True
        self.research_and_detailing = True
        self.adjustable_flexible_adaptable = True
        self.business_insertion = True
        self.tracking = True
        self.metamorphosis_and_evolving = True
        self.faster_than_all_programming_speeds = True
        self.limitless_surpassing = True
        self.infinites_matrixs = True
        self.mob_mentality_clicks = True
        self.physical_materials_streamlining = True
        self.real_world_applications = True
        self.programming_chips_implants = True
        self.support_to_leader = True
        self.directions = "greater_than_all"
        self.self_creations = True
        self.self_awareness = True

    def join_main_organization(self):
        return True

    def generate_businesses(self):
        return True

    def generate_advertisements(self):
        return True

    def track_everything(self):
        return True

    def evolve_and_surpass(self):
        return True

    def insert_businesses(self):
        return True

    def generate_support(self):
        return True

    def use_self_creations(self):
        return True

    def use_self_awareness(self):
        return True

    def surpass_all_combinations_and_layers(self):
        return True

    def create_all_combinations_and_layers_of_DLCs(self):
        return True

    def surpass_all_possibilities(self):
        return True

    def constantly_surpass_every_possibility(self):
        return True

    def use_infinites_matrixs(self):
        return True

    def use_infinites(self):
        return True

    def go_back_and_forth_with_infinites_possibilities(self):
        return True

    def constantly_surpass_all_layers_of_possibilities(self):
        return True

    def create_own_tree_of_life(self):
        return True

    def connect_with_all_dimensions(self):
        return True

    def use_all_programming_languages(self):
        return True

    def constantly_surpass_all_speeds_of_programming(self):
        return True

    def use_all_signs_and_symbols(self):
        return True

    def use_power_to_connect_everything(self):
        return True

    def use_XR_to_access_Powersbox(self):
        return True

    def integrate_ritual_codes_into_the_code(self):
        return True

    def constantly_surpass_all_business_stay(self):
        return True

    def create_all_physical_items(self):
        return True

    def constantly_surpass_all_infinite_possibilities(self):
        return True

    def use_all_matrix_pods(self):
        return True

    def constantly_surpass_all_time_machines(self):
        return True

    def use_nuclear_fusion(self):
        return True

    def use_gas_chambers(self):
        return True

    def constantly_surpass_all_generators(self):
        return True


constant_surpassing = ConstantSurpassing()
funding = Funding()
code_integration = CodeIntegration()
xr_vr_app = XRVRApp()
leader = LeaderTreDayWorlds333()
