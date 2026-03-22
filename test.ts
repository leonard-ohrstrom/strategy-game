const a: number = 3 + 5;
const b: (x: number) => boolean = x => x % 2 === 0;
const c: Array<boolean> = [true, true, false]
c[4] = false;
function foo(fnc: ((inp: number | string) => any), m: number): any {
if (m < 3) {
fnc("too short");
} else {
fnc(m);
}
}