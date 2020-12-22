import { JSDOM } from "jsdom";

const jsdomOptions = {
	pretendToBeVisual: true,
	storageQuota: 1e9,
	resources: "usable",
	runScripts: "dangerously"
};

const jsdom = new JSDOM(
	`<!DOCTYPE html><body id="main"><p >Hello world</p></body>`,
	jsdomOptions
);

const window = jsdom.window;
export const Blob = window.Blob;
export const atob = window.atob;
export const DOMParser = window.DOMParser;
export const document = window.document;
export const XMLHttpRequest = window.XMLHttpRequest;
export const TextEncoder = window.TextEncoder;
export const TextDecoder = window.TextDecoder;
export const decodeURIComponent = window.decodeURIComponent;
export const CustomEvent = window.CustomEvent;
export const WebGLRenderingContext = window.WebGLRenderingContext;
export const WebGL2RenderingContext = window.WebGL2RenderingContext;
export const innerWidth = window.innerWidth;
export const innerHeight = window.innerHeight;
export const DeviceOrientationEvent = window.DeviceOrientationEvent;
export const orientation = window.orientation;
export const addEventListener = window.addEventListener;
export const removeEventListener = window.removeEventListener;
export const focus = window.focus;
export const pageXOffset = window.pageXOffset;
export const pageYOffset = window.pageYOffset;
export const FileReader = window.FileReader;
export const URL = window.URL;
export const ActiveXObject = window.ActiveXObject;
export const AudioContext = window.AudioContext;
export const webkitAudioContext = window.webkitAudioContext;
export const XRHand = window.XRHand;
