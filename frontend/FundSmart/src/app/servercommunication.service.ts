import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { SocialUser } from "angularx-social-login";
import { IntercomponentCommunicationService } from './intercomponent-communication.service';
import { holdindDetail } from './holding-details/holdingDetail';
import { portfolioidSelect } from './fund/portfolioid_select';

@Injectable({
    providedIn: 'root'
})

export class ServercommunicationService {
    //api_link = 'http://3.130.87.74/';
    // api_link = 'http://localhost:8000/';
    api_link = 'http://192.168.100.111:8000/';
    // api_link = 'http://127.0.0.1:8000/';
    socialuser: SocialUser;
    currentuser: any;
    httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
    getHttpheader = new HttpHeaders({ 'Content-type': 'application/json' });
    count = 0;

    constructor(
        private http: HttpClient,
        private interconn: IntercomponentCommunicationService
    ) { }
    userkey: string;

    doRegistration(body) {
        return this.http.post(this.api_link + 'rest-auth/registration/', body, { headers: this.httpHeaders });
    }

    doLogin(username, password) {
        const user = {
            username: username,
            password: password
        };
        return this.http.post(this.api_link + 'rest-auth/login/', user, { headers: this.httpHeaders });
    }

    socialLogin(user) {
        this.socialuser = user;
        const body = { access_token: user.authToken };
        this.http.post(this.api_link + 'rest-auth/google/', body, { headers: this.httpHeaders }).toPromise().then(data => {
            localStorage.setItem('authkey', data['key']);
            this.getUser(data['key']);
        });
    }

    getUser(key: string) {
        this.userkey = key;
        this.http.get(this.api_link + 'rest-auth/user/', {
            headers: new HttpHeaders({ Authorization: 'Token ' + key })
        }).toPromise().then(userdata => {
            this.currentuser = userdata;
            this.interconn.callComponentMethod();
        });
    }

    change_password(oldpass: string, newpass: string, confirmpass: string) {
        const body = {
            old_password: oldpass,
            new_password1: newpass,
            new_password2: confirmpass
        };
        return this.http.post(this.api_link + 'rest-auth/password/change/', body, {
            headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        });
    }

    reset_pwd_sendemail(emailid: string) {
        const body = { email: emailid };
        return this.http.post(this.api_link + 'rest-auth/password/reset/', body, { headers: this.httpHeaders });
    }

    resetpassword_req(userid: string, usertoken: string, pass1: string, pass2: string) {
        const body = {
            uid: userid,
            token: usertoken,
            new_password1: pass1,
            new_password2: pass2
        };
        return this.http.post(this.api_link + 'rest-auth/password/reset/confirm/', body, { headers: this.httpHeaders });
    }

    update_User(user: any) {
        const body = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number
        };
        return this.http.put(this.api_link + 'rest-auth/user/',
            body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    uploadfile(file) {
        return this.http.post(this.api_link + 'api/import_portfolio_fund/', file, {
            headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        });
    }

    uploadfile_Createfund(file, pids) {
        return this.http.post(this.api_link + 'api/import_portfolio_fund/?portfolio_ids=' + pids, file, {
            headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        });
    }


    get_portfolio_fund() {
        if (this.userkey) {
            return this.http.get(this.api_link + 'api/portfolio_fund/', {
                headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
            });
        }
    }


    get_portfolio_fund_by_date(date: any, portfolioid: any, portfolio_ids: any) {
        if (this.userkey) {
            if (portfolioid === undefined) {
                return this.http.get(this.api_link + 'api/portfolio_fund/?date=' + date + '&portfolio_ids=' + portfolio_ids, {
                    headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
                });
            }
            else {
                return this.http.get(this.api_link + 'api/portfolio_fund/?date=' + date + '&portfolio=' + portfolioid + '&portfolio_ids=' + portfolio_ids, {
                    headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
                });
            }
        }
    }

    getSecurity() {
        return this.http.get(this.api_link + 'api/security/', { headers: this.httpHeaders });
    }

    get_home_pie_chart() {
        let body = JSON.parse(localStorage.getItem('securityData'));
        // if (this.userkey) {
        //     return this.http.post(this.api_link + 'api/dashboard_pie_chart/', { data: body }, {
        //         headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        //     });
        // } else {
        return this.http.post(this.api_link + 'api/dashboard_pie_chart/', { data: body , currency: 'INR'});
        // }
    }

    get_deshboard_doughnut_chart() {
        let body = JSON.parse(localStorage.getItem('securityData'));
        // if (this.userkey) {
        //     return this.http.post(this.api_link + 'api/dashboard_doughnut_chart/', { data: body }, {
        //         headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        //     });
        // } else {
        return this.http.post(this.api_link + 'api/dashboard_doughnut_chart/', { data: body , currency: 'INR'});
        // }
    }

    get_historical_perfomance() {
        let body = JSON.parse(localStorage.getItem('securityData'));
        // if (this.userkey) {
        //     return this.http.post(this.api_link + 'api/historical_performance_difference/', { data: body }, {
        //         headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        //     });
        // } else {
        return this.http.post(this.api_link + 'api/historical_performance_difference/', { data: body , currency: 'INR'});
        // }
    }

    add_portfolio_fund(fquantity, userportfolio, selectedsecurity, createdby, date) {
        const body = {
            quantity: fquantity,
            portfolio: userportfolio,
            security: selectedsecurity,
            created_by: createdby
        };
        return this.http.post(this.api_link + 'api/portfolio_fund/?date=' + date, body,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getUserPortfolio() {
        return this.http.get(this.api_link + 'api/portfolio/',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    checklogin() {
        var userkey = null;
        userkey = localStorage.getItem('authkey');
        if (userkey != null) {
            this.getUser(userkey);
        }
    }

    logout() {
        localStorage.removeItem('authkey');
        this.http.post(this.api_link + 'rest-auth/logout/',
            { headers: this.httpHeaders }).toPromise().then(
                data => {
                    this.userkey = null;
                    this.currentuser = undefined;
                    portfolioidSelect.length = 0;
                    this.interconn.afterlogout();
                });
    }

    confirm_email(verificationkey) {
        const body = { key: verificationkey };
        return this.http.post(this.api_link + 'rest-auth/registration/verify-email/', body, { headers: this.httpHeaders });
    }

    createportfolio() {
        var portfolioname = '';
        const body = {
            name: portfolioname,
            created_by: this.currentuser.id
        };
        return this.http.post(this.api_link + 'api/portfolio/', body,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });

    }

    updateportfoliofund(recid, fquantity, userportfolio, selectedsecurity, updatedby) {
        const body = {
            id: recid,
            quantity: Number.parseFloat(fquantity),
            portfolio: userportfolio,
            security: selectedsecurity,
            updated_by: updatedby,
            created_by: this.currentuser.id
        };
        return this.http.put(this.api_link + 'api/portfolio_fund/' + recid + '/', body,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    postPrice(fundid, fundprice, selected_date) {
        const body = {
            id: fundid,
            price: fundprice,
            date: selected_date
        };
        return this.http.post(this.api_link + 'api/portfolio_fund_price/', body, {
            headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        });
    }

    update_One_Object(user: any, id) {
        const body = {
            name: user.name,
            description: user.description,
            owner_1: user.owner_1,
            owner_2: user.owner_2,
            type: user.type,
            marginal_tax_range: user.marginal_tax_range,
            location: user.location,
            created_by: this.currentuser.id,
            updated_by: this.currentuser.id
        };
        return this.http.put(this.api_link + 'api/portfolio/' + id + '/',
            body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    get_Fund() {
        if (this.userkey) {
            return this.http.get(this.api_link + 'api/portfolio/', {
                headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
            });
        }
    }

    get_One_Object(id) {
        if (this.userkey) {
            return this.http.get(this.api_link + 'api/portfolio/?id=' + id, {
                headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
            });
        }
    }

    post_create_fund() {
        const body = {
            created_by: this.currentuser.id
        };
        return this.http.post(this.api_link + 'api/portfolio/', body,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    delete_Portfolio(id) {
        return this.http.delete(this.api_link + 'api/portfolio/' + id + '/',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getHoldings() {
        return this.http.get(this.api_link + 'api/holding_detail/',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    UpdateHoldingDetails(obj: holdindDetail) {
        const body = {
            id: obj.fund_id,
            portfolio: obj.portfolio,
            security: obj.security,
            isin: obj.isin,
            quantity: obj.quantity,
            ticker: obj.ticker,
            price: obj.basic_price,
            basis: obj.basis,
            basic_price: obj.basic_price,
            current_price: obj.current_price,
            market_value: obj.market_value,
            asset_class: obj.asset_class,
            currency: obj.currency,
            country: obj.country,
            industry: obj.industry,
            rating: obj.rating
        };
        return this.http.post(this.api_link + 'api/holding_detail/', body,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    dashboardDataTable() {
        return this.http.get(this.api_link + 'api/portfolio_fund_data/',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    get_lineplot_chart() {
        let body = JSON.parse(localStorage.getItem('securityData'));
        // if (this.userkey) {
        //     return this.http.post(this.api_link + 'api/dashboard_line_graph/?currency=INR', { data: body }, {
        //         headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey })
        //     });
        // } else {
        return this.http.post(this.api_link + 'api/dashboard_line_graph/', { data: body, currency: 'INR' });
        // }
    }

    holding_summary_asset(ids) {
        return this.http.get(this.api_link + 'api/asset_class_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    addPortfolioFund(user: any) {
        const body = {
            name: user.name,
            description: user.description,
            owner_1: user.owner_1,
            owner_2: user.owner_2,
            type: user.type,
            marginal_tax_range: user.marginal_tax_range,
            location: user.location,
            created_by: this.currentuser.id,
            updated_by: this.currentuser.id
        };
        return this.http.post(this.api_link + 'api/portfolio/',
            body, { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    holding_summary_industry(ids) {
        return this.http.get(this.api_link + 'api/industry_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    holding_summary_country(ids) {
        return this.http.get(this.api_link + 'api/country_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    holding_summary_fund(ids) {
        return this.http.get(this.api_link + 'api/fund_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    holding_summary_historicalPerformance(ids) {
        return this.http.get(this.api_link + 'api/historical_performance_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    allocationRecommendationHistorical(ids) {
        return this.http.get(this.api_link + 'api/allocation_historical_performance/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    holding_summary_lineGraph(ids) {
        return this.http.get(this.api_link + 'api/line_graph_holding_summary/?portfolio_ids=' + ids + '&currency=INR',
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    storedata(data) {
        var alldata = [];
        if (data) {
            let localData = JSON.parse(localStorage.getItem('securityData'));
            if (localData === null) {
                localStorage.setItem('securityData', JSON.stringify([]));
                localData = JSON.parse(localStorage.getItem('securityData'));
            }
            let format = { 'recordId': data.recordId, 'portfolio': '', 'recid': data.recid, 'COMPARISON1': '', 'COMPARISON2': '', 'securityId': data.securityId }
            if (data.key == 'p1') {
                format.portfolio = data.quantity;
                if (localData) {
                    var resultObject = this.getDimensionsByFind(localData, data.recordId);
                    if (resultObject) {
                        format.recordId = resultObject.recordId;
                        format.portfolio = data.quantity;
                        format.recid = resultObject.recid;
                        format.COMPARISON1 = resultObject.COMPARISON1;
                        format.COMPARISON2 = resultObject.COMPARISON2;
                        format.securityId = resultObject.securityId;
                        localData.forEach((key, value) => {
                            if ((localData[value].recordId == data.recordId)) {
                                localData[value] = format;
                            }
                        });
                    } else {
                        localData.push(format);
                    }
                }
            }
            if (data.key == 'p2') {
                format.COMPARISON1 = data.quantity;
                if (localData) {
                    var resultObject = this.getDimensionsByFind(localData, data.recordId);
                    if (resultObject) {
                        format.recordId = resultObject.recordId;
                        format.portfolio = resultObject.portfolio;
                        format.recid = resultObject.recid;
                        format.COMPARISON1 = data.quantity;
                        format.COMPARISON2 = resultObject.COMPARISON2;
                        format.securityId = resultObject.securityId;
                        localData.forEach((key, value) => {
                            if ((localData[value].recordId == data.recordId)) {
                                localData[value] = format;
                            }
                        });
                    } else {
                        localData.push(format);
                    }
                }
            }
            if (data.key == 'p3') {
                format.COMPARISON2 = data.quantity;
                if (localData) {
                    var resultObject = this.getDimensionsByFind(localData, data.recordId);
                    if (resultObject) {
                        format.recordId = resultObject.recordId;
                        format.portfolio = resultObject.portfolio;
                        format.recid = resultObject.recid;
                        format.COMPARISON1 = resultObject.COMPARISON1;
                        format.COMPARISON2 = data.quantity;
                        format.securityId = resultObject.securityId;
                        localData.forEach((key, value) => {
                            if ((localData[value].recordId == data.recordId)) {
                                localData[value] = format;
                            }
                        });
                    } else {
                        localData.push(format);
                    }
                }
            }
            if (localData) {
                localStorage.setItem('securityData', JSON.stringify(localData));
            } else {
                alldata.push(format);
                localStorage.setItem('securityData', JSON.stringify(alldata));
            }
        }
    }

    removedata(id) {
        if (id >= 0) {
            const storageData = JSON.parse(localStorage.getItem('securityData'));
            const index = storageData.findIndex(order => order.recordId === id);
            storageData.splice(index, 1);
            const resetData = [];
            storageData.forEach((key, value) => {
                key.recordId = value;
                resetData.push(key);
            });
            localStorage.setItem('securityData', JSON.stringify(resetData));
        }
    }

    getDimensionsByFind(arrayValue, recordId) {
        return arrayValue.find(x => x.recordId === recordId);
    }

    get(apiUrl) {
        const url = `${this.api_link}${apiUrl}`;
        return this.http.get(url,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    fundRecommendationLineChart(ids) {
        return this.http.get(this.api_link + 'api/line_graph_fund_recommendation/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    delete_PortfolioFund(id, portfolioIds) {
        return this.http.delete(this.api_link + 'api/portfolio_fund/' + id + '/?portfolio_ids=' + portfolioIds,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getCurrentAllocation(ids) {
        return this.http.get(this.api_link + 'api/current_allocation/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getLineGraph(ids) {
        return this.http.get(this.api_link + 'api/allocation_line_graph/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getSelectedPortfolios(ids) {
        return this.http.get(this.api_link + 'api/portfolio_fund/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getHoldingSummaryFundRec(ids) {
        return this.http.get(this.api_link + 'api/historical_performance_fund_recommendation/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getPortfolioPerformance(ids) {
        return this.http.get(this.api_link + 'api/portfolio_performance/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getRecommendedPerformance(ids) {
        return this.http.get(this.api_link + 'api/recommended_performance/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getBarPlotPerformance(ids) {
        return this.http.get(this.api_link + 'api/bar_plot_fund_recommendation/?portfolio_ids=' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    getHoldingDetails(ids) {
        return this.http.get(this.api_link + 'api/holding_detail/?portfolio_ids' + ids,
            { headers: new HttpHeaders({ Authorization: 'Token ' + this.userkey }) });
    }

    // production api ----->3.16.111.80

    // 3.16.111.80 server
}
