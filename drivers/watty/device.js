"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WattyDevice_instances, _WattyDevice_api, _WattyDevice_deviceId, _WattyDevice_throttle, _WattyDevice_currency, _WattyDevice_cachedNordPoolPrice, _WattyDevice_area, _WattyDevice_prevPowerProduction, _WattyDevice_prevUpdate, _WattyDevice_prevPower, _WattyDevice_prevCurrentL1, _WattyDevice_prevCurrentL2, _WattyDevice_prevCurrentL3, _WattyDevice_prevConsumption, _WattyDevice_prevCost, _WattyDevice_wsSubscription, _WattyDevice_resubscribeDebounce, _WattyDevice_resubscribeMaxWaitMilliseconds, _WattyDevice_powerChangedTrigger, _WattyDevice_consumptionChangedTrigger, _WattyDevice_costChangedTrigger, _WattyDevice_currentL1ChangedTrigger, _WattyDevice_currentL2ChangedTrigger, _WattyDevice_currentL3ChangedTrigger, _WattyDevice_dailyConsumptionReportTrigger, _WattyDevice_subscribeToLive;
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = require("homey");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const http_min_1 = __importDefault(require("http.min"));
const lodash_1 = __importDefault(require("lodash"));
const api_1 = require("../../lib/api");
const newrelic_transaction_1 = require("../../lib/newrelic-transaction");
const helpers_1 = require("../../lib/helpers");
class WattyDevice extends homey_1.Device {
    constructor() {
        super(...arguments);
        _WattyDevice_instances.add(this);
        _WattyDevice_api.set(this, void 0);
        _WattyDevice_deviceId.set(this, void 0);
        _WattyDevice_throttle.set(this, void 0);
        _WattyDevice_currency.set(this, void 0);
        _WattyDevice_cachedNordPoolPrice.set(this, null);
        _WattyDevice_area.set(this, void 0);
        _WattyDevice_prevPowerProduction.set(this, void 0);
        _WattyDevice_prevUpdate.set(this, void 0);
        _WattyDevice_prevPower.set(this, void 0);
        _WattyDevice_prevCurrentL1.set(this, void 0);
        _WattyDevice_prevCurrentL2.set(this, void 0);
        _WattyDevice_prevCurrentL3.set(this, void 0);
        _WattyDevice_prevConsumption.set(this, void 0);
        _WattyDevice_prevCost.set(this, void 0);
        _WattyDevice_wsSubscription.set(this, void 0);
        _WattyDevice_resubscribeDebounce.set(this, void 0);
        _WattyDevice_resubscribeMaxWaitMilliseconds.set(this, void 0);
        _WattyDevice_powerChangedTrigger.set(this, void 0);
        _WattyDevice_consumptionChangedTrigger.set(this, void 0);
        _WattyDevice_costChangedTrigger.set(this, void 0);
        _WattyDevice_currentL1ChangedTrigger.set(this, void 0);
        _WattyDevice_currentL2ChangedTrigger.set(this, void 0);
        _WattyDevice_currentL3ChangedTrigger.set(this, void 0);
        _WattyDevice_dailyConsumptionReportTrigger.set(this, void 0);
    }
    async onInit() {
        const { id, t: token } = this.getData();
        __classPrivateFieldSet(this, _WattyDevice_api, new api_1.TibberApi(this.log, this.homey.settings, id, token), "f");
        __classPrivateFieldSet(this, _WattyDevice_deviceId, id, "f");
        __classPrivateFieldSet(this, _WattyDevice_throttle, this.getSetting('pulse_throttle') || 30, "f");
        __classPrivateFieldSet(this, _WattyDevice_powerChangedTrigger, this.homey.flow.getDeviceTriggerCard('watty_power_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_consumptionChangedTrigger, this.homey.flow.getDeviceTriggerCard('watty_consumption_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_costChangedTrigger, this.homey.flow.getDeviceTriggerCard('watty_cost_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_currentL1ChangedTrigger, this.homey.flow.getDeviceTriggerCard('current.L1_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_currentL2ChangedTrigger, this.homey.flow.getDeviceTriggerCard('current.L2_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_currentL3ChangedTrigger, this.homey.flow.getDeviceTriggerCard('current.L3_changed'), "f");
        __classPrivateFieldSet(this, _WattyDevice_dailyConsumptionReportTrigger, this.homey.flow.getDeviceTriggerCard('watty_daily_consumption_report'), "f");
        this.log(`Tibber Watty device ${this.getName()} has been initialized (throttle: ${__classPrivateFieldGet(this, _WattyDevice_throttle, "f")})`);
        const jitterSeconds = (0, helpers_1.randomBetweenRange)(0, 10);
        const delaySeconds = 10 * 60;
        __classPrivateFieldSet(this, _WattyDevice_resubscribeMaxWaitMilliseconds, (jitterSeconds + delaySeconds) * 1000, "f");
        __classPrivateFieldSet(this, _WattyDevice_resubscribeDebounce, lodash_1.default.debounce(__classPrivateFieldGet(this, _WattyDevice_instances, "m", _WattyDevice_subscribeToLive).bind(this), __classPrivateFieldGet(this, _WattyDevice_resubscribeMaxWaitMilliseconds, "f")), "f");
        await __classPrivateFieldGet(this, _WattyDevice_instances, "m", _WattyDevice_subscribeToLive).call(this);
    }
    async onSettings({ newSettings, changedKeys, }) {
        if (changedKeys.includes('pulse_throttle')) {
            this.log('Updated throttle value: ', newSettings.pulse_throttle);
            __classPrivateFieldSet(this, _WattyDevice_throttle, Number(newSettings.pulse_throttle) || 30, "f");
        }
        if (changedKeys.includes('pulse_currency')) {
            this.log('Updated currency value: ', newSettings.pulse_currency);
            __classPrivateFieldSet(this, _WattyDevice_currency, newSettings.pulse_currency, "f");
            __classPrivateFieldSet(this, _WattyDevice_cachedNordPoolPrice, null, "f");
        }
        if (changedKeys.includes('pulse_area')) {
            this.log('Updated area value: ', newSettings.pulse_area);
            __classPrivateFieldSet(this, _WattyDevice_area, newSettings.pulse_area, "f");
            __classPrivateFieldSet(this, _WattyDevice_cachedNordPoolPrice, null, "f");
        }
    }
    async subscribeCallback(result) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        __classPrivateFieldGet(this, _WattyDevice_resubscribeDebounce, "f").call(this);
        const power = (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.liveMeasurement) === null || _b === void 0 ? void 0 : _b.power;
        const powerProduction = (_d = (_c = result.data) === null || _c === void 0 ? void 0 : _c.liveMeasurement) === null || _d === void 0 ? void 0 : _d.powerProduction;
        if (powerProduction)
            __classPrivateFieldSet(this, _WattyDevice_prevPowerProduction, powerProduction, "f");
        if (__classPrivateFieldGet(this, _WattyDevice_prevUpdate, "f") &&
            (0, moment_timezone_1.default)().diff(__classPrivateFieldGet(this, _WattyDevice_prevUpdate, "f"), 'seconds') < __classPrivateFieldGet(this, _WattyDevice_throttle, "f"))
            return;
        __classPrivateFieldSet(this, _WattyDevice_prevUpdate, (0, moment_timezone_1.default)(), "f");
        const measurePower = power || -powerProduction || -__classPrivateFieldGet(this, _WattyDevice_prevPowerProduction, "f");
        this.log(`Set 'measure_power' capability to`, measurePower);
        this.setCapabilityValue('measure_power', measurePower)
            .catch(console.error)
            .finally(() => {
            if (measurePower !== __classPrivateFieldGet(this, _WattyDevice_prevPower, "f")) {
                __classPrivateFieldSet(this, _WattyDevice_prevPower, measurePower, "f");
                this.log(`Trigger power changed`, measurePower);
                __classPrivateFieldGet(this, _WattyDevice_powerChangedTrigger, "f")
                    .trigger(this, { power: measurePower })
                    .catch(console.error);
            }
        });
        const currentL1 = (_f = (_e = result.data) === null || _e === void 0 ? void 0 : _e.liveMeasurement) === null || _f === void 0 ? void 0 : _f.currentL1;
        const currentL2 = (_h = (_g = result.data) === null || _g === void 0 ? void 0 : _g.liveMeasurement) === null || _h === void 0 ? void 0 : _h.currentL2;
        const currentL3 = (_k = (_j = result.data) === null || _j === void 0 ? void 0 : _j.liveMeasurement) === null || _k === void 0 ? void 0 : _k.currentL3;
        this.log(`Latest current values [L1: ${currentL1}, L2: ${currentL2}, L3: ${currentL3}]`);
        if (currentL1 !== undefined && currentL1 !== null) {
            this.setCapabilityValue('measure_current.L1', currentL1)
                .catch(console.error)
                .finally(() => {
                this.log("Set 'measure_current.L1' capability to", currentL1);
                if (currentL1 !== __classPrivateFieldGet(this, _WattyDevice_prevCurrentL1, "f")) {
                    __classPrivateFieldSet(this, _WattyDevice_prevCurrentL1, currentL1, "f");
                    this.log(`Trigger current L1 changed`, currentL1);
                    __classPrivateFieldGet(this, _WattyDevice_currentL1ChangedTrigger, "f")
                        .trigger(this, { currentL1 })
                        .catch(console.error);
                }
            });
        }
        if (currentL2 !== undefined && currentL2 !== null) {
            this.setCapabilityValue('measure_current.L2', currentL2)
                .catch(console.error)
                .finally(() => {
                this.log("Set 'measure_current.L2' capability to", currentL2);
                if (currentL2 !== __classPrivateFieldGet(this, _WattyDevice_prevCurrentL2, "f")) {
                    __classPrivateFieldSet(this, _WattyDevice_prevCurrentL2, currentL2, "f");
                    this.log(`Trigger current L2 changed`, currentL2);
                    __classPrivateFieldGet(this, _WattyDevice_currentL2ChangedTrigger, "f")
                        .trigger(this, { currentL2 })
                        .catch(console.error);
                }
            });
        }
        if (currentL3 !== undefined && currentL3 !== null) {
            this.setCapabilityValue('measure_current.L3', currentL3)
                .catch(console.error)
                .finally(() => {
                this.log("Set 'measure_current.L3' capability to", currentL3);
                if (currentL3 !== __classPrivateFieldGet(this, _WattyDevice_prevCurrentL3, "f")) {
                    __classPrivateFieldSet(this, _WattyDevice_prevCurrentL3, currentL3, "f");
                    this.log(`Trigger current L3 changed`, currentL3);
                    __classPrivateFieldGet(this, _WattyDevice_currentL3ChangedTrigger, "f")
                        .trigger(this, { currentL3 })
                        .catch(console.error);
                }
            });
        }
        const consumption = (_m = (_l = result.data) === null || _l === void 0 ? void 0 : _l.liveMeasurement) === null || _m === void 0 ? void 0 : _m.accumulatedConsumption;
        if (consumption !== undefined) {
            const fixedConsumption = Number(consumption.toFixed(2));
            if (fixedConsumption !== __classPrivateFieldGet(this, _WattyDevice_prevConsumption, "f")) {
                if (fixedConsumption < __classPrivateFieldGet(this, _WattyDevice_prevConsumption, "f")) {
                    this.log('Triggering daily consumption report');
                    __classPrivateFieldGet(this, _WattyDevice_dailyConsumptionReportTrigger, "f")
                        .trigger(this, {
                        consumption: __classPrivateFieldGet(this, _WattyDevice_prevConsumption, "f"),
                        cost: __classPrivateFieldGet(this, _WattyDevice_prevCost, "f"),
                    })
                        .catch(console.error);
                }
                __classPrivateFieldSet(this, _WattyDevice_prevConsumption, fixedConsumption, "f");
                this.setCapabilityValue('meter_power', fixedConsumption)
                    .catch(console.error)
                    .finally(() => {
                    __classPrivateFieldGet(this, _WattyDevice_consumptionChangedTrigger, "f")
                        .trigger(this, { consumption: fixedConsumption })
                        .catch(console.error);
                });
            }
        }
        let cost = (_p = (_o = result.data) === null || _o === void 0 ? void 0 : _o.liveMeasurement) === null || _p === void 0 ? void 0 : _p.accumulatedCost;
        if (cost === undefined || cost === null) {
            try {
                const now = (0, moment_timezone_1.default)();
                if (__classPrivateFieldGet(this, _WattyDevice_cachedNordPoolPrice, "f") === null ||
                    __classPrivateFieldGet(this, _WattyDevice_cachedNordPoolPrice, "f").hour !== now.hour()) {
                    const area = __classPrivateFieldGet(this, _WattyDevice_area, "f") || 'Oslo';
                    const currency = __classPrivateFieldGet(this, _WattyDevice_currency, "f") || 'NOK';
                    this.log(`Using Nord Pool prices. Currency: ${currency} - Area: ${area}`);
                    const priceResult = await (0, newrelic_transaction_1.startTransaction)('GetNordPoolPrices.Watty', 'External', () => http_min_1.default.json(`https://www.nordpoolgroup.com/api/marketdata/page/10?currency=${currency},${currency},${currency},${currency}&endDate=${(0, moment_timezone_1.default)()
                        .tz('Europe/Oslo')
                        .format('DD-MM-YYYY')}`));
                    const filteredRows = ((_q = priceResult === null || priceResult === void 0 ? void 0 : priceResult.data.Rows) !== null && _q !== void 0 ? _q : [])
                        .filter((row) => !row.IsExtraRow &&
                        moment_timezone_1.default.tz(row.StartTime, 'Europe/Oslo').isBefore(now) &&
                        moment_timezone_1.default.tz(row.EndTime, 'Europe/Oslo').isAfter(now))
                        .map((row) => row.Columns);
                    const areaCurrentPrice = filteredRows.length
                        ? filteredRows[0].find((a) => a.Name === area)
                        : undefined;
                    if (areaCurrentPrice !== undefined) {
                        const currentPrice = Number(areaCurrentPrice.Value.replace(',', '.')
                            .replace(' ', '')
                            .trim()) / 1000;
                        __classPrivateFieldSet(this, _WattyDevice_cachedNordPoolPrice, {
                            hour: now.hour(),
                            price: currentPrice,
                        }, "f");
                        this.log(`Found price for system time ${now.format()} for area ${area} ${currentPrice}`);
                    }
                }
                if (typeof ((_r = __classPrivateFieldGet(this, _WattyDevice_cachedNordPoolPrice, "f")) === null || _r === void 0 ? void 0 : _r.price) !== 'number')
                    return;
                cost = __classPrivateFieldGet(this, _WattyDevice_cachedNordPoolPrice, "f").price * consumption;
            }
            catch (e) {
                console.error('Error fetching prices from Nord Pool', e);
            }
        }
        if (cost !== undefined && cost !== null) {
            const fixedCost = Number(cost.toFixed(2));
            if (fixedCost !== __classPrivateFieldGet(this, _WattyDevice_prevCost, "f")) {
                __classPrivateFieldSet(this, _WattyDevice_prevCost, fixedCost, "f");
                this.setCapabilityValue('accumulatedCost', fixedCost)
                    .catch(console.error)
                    .finally(() => {
                    __classPrivateFieldGet(this, _WattyDevice_costChangedTrigger, "f")
                        .trigger(this, { cost: fixedCost })
                        .catch(console.error);
                });
            }
        }
    }
    onDeleted() {
        this.destroy();
    }
    onUninit() {
        this.destroy();
    }
    destroy() {
        var _a;
        if (typeof ((_a = __classPrivateFieldGet(this, _WattyDevice_wsSubscription, "f")) === null || _a === void 0 ? void 0 : _a.unsubscribe) === 'function') {
            try {
                this.log('Unsubscribing from previous connection');
                __classPrivateFieldGet(this, _WattyDevice_wsSubscription, "f").unsubscribe();
                __classPrivateFieldGet(this, _WattyDevice_resubscribeDebounce, "f").cancel();
            }
            catch (e) {
                this.log('Error unsubscribing from previous connection', e);
            }
        }
    }
}
_WattyDevice_api = new WeakMap(), _WattyDevice_deviceId = new WeakMap(), _WattyDevice_throttle = new WeakMap(), _WattyDevice_currency = new WeakMap(), _WattyDevice_cachedNordPoolPrice = new WeakMap(), _WattyDevice_area = new WeakMap(), _WattyDevice_prevPowerProduction = new WeakMap(), _WattyDevice_prevUpdate = new WeakMap(), _WattyDevice_prevPower = new WeakMap(), _WattyDevice_prevCurrentL1 = new WeakMap(), _WattyDevice_prevCurrentL2 = new WeakMap(), _WattyDevice_prevCurrentL3 = new WeakMap(), _WattyDevice_prevConsumption = new WeakMap(), _WattyDevice_prevCost = new WeakMap(), _WattyDevice_wsSubscription = new WeakMap(), _WattyDevice_resubscribeDebounce = new WeakMap(), _WattyDevice_resubscribeMaxWaitMilliseconds = new WeakMap(), _WattyDevice_powerChangedTrigger = new WeakMap(), _WattyDevice_consumptionChangedTrigger = new WeakMap(), _WattyDevice_costChangedTrigger = new WeakMap(), _WattyDevice_currentL1ChangedTrigger = new WeakMap(), _WattyDevice_currentL2ChangedTrigger = new WeakMap(), _WattyDevice_currentL3ChangedTrigger = new WeakMap(), _WattyDevice_dailyConsumptionReportTrigger = new WeakMap(), _WattyDevice_instances = new WeakSet(), _WattyDevice_subscribeToLive = async function _WattyDevice_subscribeToLive() {
    var _a, _b, _c;
    __classPrivateFieldGet(this, _WattyDevice_resubscribeDebounce, "f").call(this);
    if (typeof ((_a = __classPrivateFieldGet(this, _WattyDevice_wsSubscription, "f")) === null || _a === void 0 ? void 0 : _a.unsubscribe) === 'function') {
        try {
            this.log(`No data received in ${__classPrivateFieldGet(this, _WattyDevice_resubscribeMaxWaitMilliseconds, "f") / 1000} seconds; Unsubscribing from previous connection`);
            __classPrivateFieldGet(this, _WattyDevice_wsSubscription, "f").unsubscribe();
        }
        catch (e) {
            this.log('Error unsubscribing from previous connection', e);
        }
    }
    let websocketSubscriptionUrl = '';
    try {
        const { viewer } = await __classPrivateFieldGet(this, _WattyDevice_api, "f").getHomeFeatures(this);
        websocketSubscriptionUrl = viewer.websocketSubscriptionUrl;
        if (!((_c = (_b = viewer === null || viewer === void 0 ? void 0 : viewer.home) === null || _b === void 0 ? void 0 : _b.features) === null || _c === void 0 ? void 0 : _c.realTimeConsumptionEnabled)) {
            this.log(`Home with id ${__classPrivateFieldGet(this, _WattyDevice_deviceId, "f")} does not have real time consumption enabled. Set device unavailable`);
            __classPrivateFieldGet(this, _WattyDevice_resubscribeDebounce, "f").cancel();
            await this.setUnavailable('Tibber home with specified id not found. Please re-add device.');
            return;
        }
    }
    catch (e) {
        this.log('Error fetching home features', e);
        return;
    }
    this.log('Subscribing to live data for homeId', __classPrivateFieldGet(this, _WattyDevice_deviceId, "f"));
    __classPrivateFieldSet(this, _WattyDevice_wsSubscription, __classPrivateFieldGet(this, _WattyDevice_api, "f")
        .subscribeToLive(websocketSubscriptionUrl)
        .subscribe((result) => this.subscribeCallback(result), (error) => {
        (0, newrelic_transaction_1.noticeError)(error);
        this.log('Subscription error occurred', error);
        const delay = (0, helpers_1.randomBetweenRange)(5, 120);
        this.log(`Resubscribe after ${delay} seconds`);
        __classPrivateFieldGet(this, _WattyDevice_resubscribeDebounce, "f").cancel();
        this.homey.setTimeout(() => __classPrivateFieldGet(this, _WattyDevice_instances, "m", _WattyDevice_subscribeToLive).call(this), delay * 1000);
    }, () => this.log('Subscription ended with no error')), "f");
};
module.exports = WattyDevice;
//# sourceMappingURL=device.js.map