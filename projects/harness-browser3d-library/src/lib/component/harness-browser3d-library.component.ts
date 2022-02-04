import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { Harness } from '../../api/alias';
import { HarnessBrowser3dLibraryAPI } from '../../api/api';
import {
  BoundingSphereAPIStruct,
  SetColorAPIStruct,
  SettingsAPIStruct,
} from '../../api/structs';
import { RenderService } from '../services/render.service';
import { CameraService } from '../services/camera.service';
import { SceneService } from '../services/scene.service';
import { HarnessService } from '../services/harness.service';
import { SelectionService } from '../services/selection.service';
import { ColorService } from '../services/color.service';
import { CacheService } from '../services/cache.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'lib-harness-browser3d',
  templateUrl: './harness-browser3d-library.component.html',
  styleUrls: ['./harness-browser3d-library.component.scss'],
})
export class HarnessBrowser3dLibraryComponent implements AfterViewInit {
  @ViewChild('harness3dBrowserCanvas')
  private canvasElement!: ElementRef<HTMLCanvasElement>;
  @Output() initialized = new EventEmitter<HarnessBrowser3dLibraryAPI>();

  constructor(
    private readonly ngZone: NgZone,
    private readonly cacheService: CacheService,
    private readonly cameraService: CameraService,
    private readonly colorService: ColorService,
    private readonly harnessService: HarnessService,
    private readonly renderService: RenderService,
    private readonly sceneService: SceneService,
    private readonly selectionService: SelectionService,
    private readonly settingsService: SettingsService,
    private readonly api: HarnessBrowser3dLibraryAPI
  ) {}

  ngAfterViewInit(): void {
    this.renderService.initRenderer(this.canvasElement.nativeElement);
    this.renderService.resizeRendererToCanvasSize();
    this.cameraService.initControls(this.canvasElement.nativeElement);
    this.sceneService.setupScene();
    this.initialized.emit(this.api);
    this.animate();
  }

  private animateImplementation() {
    requestAnimationFrame(() => this.animateImplementation());
    this.renderService.mainLoop();
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => this.animateImplementation());
  }

  @Input()
  set addHarness(harness: Harness | undefined) {
    if (harness) {
      this.harnessService.addHarness(harness);
    }
  }

  // load corresponding harness beforehand
  // all ids are in same harness
  @Input()
  set selectedIds(ids: string[]) {
    this.selectionService.selectElements(ids);
  }

  // load corresponding harness beforehand
  // all ids are in same harness
  @Input()
  set colors(colors: SetColorAPIStruct[]) {
    this.colorService.setColors(colors);
  }

  @Input()
  set settings(additionalSettings: SettingsAPIStruct | undefined) {
    if (additionalSettings) {
      this.settingsService.add(additionalSettings);
      this.api.clear();
      this.cacheService.clear();
      this.renderService.resizeRendererToCanvasSize();
      this.sceneService.setupScene();
    }
  }

  @Input()
  set boundingSphere(sphere: BoundingSphereAPIStruct) {
    const centerElement = this.cacheService.elementCache.get(sphere.centerId);
    if (centerElement && 'placement' in centerElement) {
      this.selectionService.drawBoundingSphere(centerElement, sphere.radius);
    } else {
      console.log(`element '${sphere.centerId}' is not found`);
    }
  }
}
