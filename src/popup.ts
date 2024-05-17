import "./popup.css";
import "./assets/loader.css";
import "./assets/success.css";
import { createApp } from "vue";
import Popup from "./Popup.vue";

const div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);

createApp(Popup).mount("#app");
