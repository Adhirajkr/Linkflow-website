import { hero, connect, finale } from './intro.js';
import { pairing } from './pairing.js';
import { clipboard } from './clipboard.js';
import { files } from './files.js';
import { camera } from './camera.js';
import { screen } from './screen.js';
import { audio } from './audio.js';
import { usb } from './usb.js';
import { trackpad } from './trackpad.js';
import { controller } from './controller.js';
import { autotype } from './autotype.js';
import { customization } from './customization.js';

// Each demo owns its own file. Add a new one here and give its section data-stage="<id>".
export const DEMOS = Object.fromEntries([hero, connect, pairing, clipboard, files, camera, screen, audio, usb, trackpad, controller, autotype, customization, finale].map((d) => [d.id, d]));
