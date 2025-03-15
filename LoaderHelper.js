export class LoaderHelper {
    loaded = false;
    max = 0;
    cnt = 0;
    fnct;

    constructor(max, fnct) {
        this.max = max;
        this.fnct = fnct;
    }

    add() {
        this.cnt++;
        if (this.cnt >= this.max) {
            this.loaded = true;
            if (this.fnct) {
                this.fnct(); // Call the function when loaded becomes true
            }
        }
    }
}