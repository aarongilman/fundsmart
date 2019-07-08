import { Component, OnInit } from '@angular/core';
import { portfolio_fund } from '../portfolio_fund';

@Component({
  selector: 'app-testingdata',
  templateUrl: './testingdata.component.html',
  styleUrls: ['./testingdata.component.css']
})
export class TestingdataComponent implements OnInit {
  p1 = 9; p2 = 11; p3 = 14;

  portfolioids = [[12, 41, 54], [18, 27], [32]];


  list = [
    {
      "id": 12,
      "quantity": "400",
      "created_at": "2019-06-17T06:15:47.106590Z",
      "updated_at": "2019-07-03T12:11:14.523694Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 50.0
    },
    {
      "id": 15,
      "quantity": "39",
      "created_at": "2019-06-17T06:15:47.106737Z",
      "updated_at": "2019-06-28T12:25:59.523728Z",
      "portfolio": 9,
      "security": 2,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "IDFC Dynamic Equity Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF194KA1UE8",
      "price": 0
    },
    {
      "id": 18,
      "quantity": "60.0",
      "created_at": "2019-06-17T06:15:47.106884Z",
      "updated_at": "2019-06-17T06:15:47.106898Z",
      "portfolio": 9,
      "security": 5,
      "created_by": 1,
      "updated_by": null,
      "security_name": "SBI-ETF Nifty 50",
      "asset_type": "ETF",
      "isin": "INF200KA1FS1",
      "price": 0
    },
    {
      "id": 32,
      "quantity": "40",
      "created_at": "2019-06-19T12:54:32.456106Z",
      "updated_at": "2019-06-28T09:00:25.642029Z",
      "portfolio": 9,
      "security": 11,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "United Spirits Limited",
      "asset_type": "Equity",
      "isin": "INE854D01024",
      "price": 0
    },
    {
      "id": 36,
      "quantity": "106",
      "created_at": "2019-07-02T11:30:37.766954Z",
      "updated_at": "2019-07-02T12:11:48.988616Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 125.0
    },
    {
      "id": 37,
      "quantity": "200",
      "created_at": "2019-07-02T12:10:12.206433Z",
      "updated_at": "2019-07-05T04:45:23.850189Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 500.0
    },
    {
      "id": 38,
      "quantity": "207",
      "created_at": "2019-07-02T12:11:01.348025Z",
      "updated_at": "2019-07-03T06:03:02.529756Z",
      "portfolio": 11,
      "security": 2,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "IDFC Dynamic Equity Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF194KA1UE8",
      "price": 1600.0
    },
    {
      "id": 39,
      "quantity": "15",
      "created_at": "2019-07-02T12:11:41.865727Z",
      "updated_at": "2019-07-02T12:11:41.865762Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 40,
      "quantity": "12",
      "created_at": "2019-07-02T12:12:15.393284Z",
      "updated_at": "2019-07-03T11:11:43.971427Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 41,
      "quantity": "10",
      "created_at": "2019-07-02T12:12:48.783486Z",
      "updated_at": "2019-07-02T12:12:48.783521Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 42,
      "quantity": "60",
      "created_at": "2019-07-02T12:13:04.040990Z",
      "updated_at": "2019-07-02T12:13:04.041026Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 43,
      "quantity": "109",
      "created_at": "2019-07-02T12:13:07.720663Z",
      "updated_at": "2019-07-05T04:53:06.168842Z",
      "portfolio": 14,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 44,
      "quantity": "122",
      "created_at": "2019-07-03T09:27:41.136561Z",
      "updated_at": "2019-07-05T04:52:59.631151Z",
      "portfolio": 14,
      "security": 1,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 45,
      "quantity": "100",
      "created_at": "2019-07-03T10:03:54.245790Z",
      "updated_at": "2019-07-03T10:08:04.003140Z",
      "portfolio": 14,
      "security": 590,
      "created_by": 1,
      "updated_by": 1,
      "security_name": "KRIBHCO Fertilizers Ltd. **",
      "asset_type": "Bond",
      "isin": "INE486H14AF0",
      "price": 900.0
    },
    {
      "id": 53,
      "quantity": "123",
      "created_at": "2019-07-04T05:03:14.687105Z",
      "updated_at": "2019-07-04T05:03:14.687146Z",
      "portfolio": 14,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 54,
      "quantity": "25",
      "created_at": "2019-07-04T05:40:52.367847Z",
      "updated_at": "2019-07-04T05:40:52.367919Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 700.0
    },
    {
      "id": 55,
      "quantity": "63",
      "created_at": "2019-07-04T05:41:05.907690Z",
      "updated_at": "2019-07-04T05:41:05.907758Z",
      "portfolio": 14,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 560.0
    },
    {
      "id": 56,
      "quantity": "52",
      "created_at": "2019-07-04T05:41:20.946189Z",
      "updated_at": "2019-07-04T05:41:20.946256Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 57,
      "quantity": "12",
      "created_at": "2019-07-04T05:47:29.819829Z",
      "updated_at": "2019-07-04T05:47:29.819874Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 60.0
    },
    {
      "id": 58,
      "quantity": "65",
      "created_at": "2019-07-04T05:48:34.050858Z",
      "updated_at": "2019-07-04T05:48:34.050897Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 30.0
    },
    {
      "id": 59,
      "quantity": "13",
      "created_at": "2019-07-04T05:52:53.599697Z",
      "updated_at": "2019-07-04T05:52:53.599754Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 63,
      "quantity": "25",
      "created_at": "2019-07-04T06:43:46.861284Z",
      "updated_at": "2019-07-04T06:43:46.861354Z",
      "portfolio": 11,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    },
    {
      "id": 73,
      "quantity": "79",
      "created_at": "2019-07-04T11:58:15.216858Z",
      "updated_at": "2019-07-04T11:58:15.216910Z",
      "portfolio": 9,
      "security": 1,
      "created_by": 1,
      "updated_by": null,
      "security_name": "Motilal Oswal Dynamic Fund",
      "asset_type": "Mutual Fund",
      "isin": "INF247L01585",
      "price": 0
    }
  ];

  fundlist: portfolio_fund[] = []

  constructor() { }

  ngOnInit() {
    this.designData();
  }

  designData() {
    let singlefund: portfolio_fund = {
      security: '',
      security_id: -1,
      p1record: -1,
      p2record: -1,
      p3record: -1,
      yourPortfolio: '',
      comparision1: '',
      comparision2: ''
    };

    for (var item = 0; item < this.portfolioids.length; item++) {
      for (var i = 0; i < this.portfolioids[item].length; i++) {
        debugger;
        const result1 = this.list.find(res => res.id === this.portfolioids[item][i]);
        singlefund.security_id = result1.security;
        singlefund.security = result1.security_name;
        if (this.p1 === result1.portfolio) {
          singlefund.yourPortfolio = result1.quantity;
          singlefund.p1record = result1.id;
        } else if (this.p2 === result1.portfolio) {
          singlefund.comparision1 = result1.quantity;
          singlefund.p2record = result1.id;
        } else if (this.p3 === result1.portfolio) {
          singlefund.comparision2 = result1.quantity;
          singlefund.p3record = result1.id;
        }
        if (i < this.portfolioids[item].length) {
          i++;
          const result2 = this.list.find(res => res.id === this.portfolioids[item][i]);
          if (this.p1 === result2.portfolio) {
            singlefund.yourPortfolio = result2.quantity;
            singlefund.p1record = result2.id;
          } else if (this.p2 === result2.portfolio) {
            singlefund.comparision1 = result2.quantity;
            singlefund.p2record = result2.id;
          } else if (this.p3 === result2.portfolio) {
            singlefund.comparision2 = result2.quantity;
            singlefund.p3record = result2.id;
          }
        }
        if (i < this.portfolioids[item].length) {
          i++;
          const result3 = this.list.find(res => res.id === this.portfolioids[item][i]);
          if (this.p1 === result3.portfolio) {
            singlefund.yourPortfolio = result3.quantity;
            singlefund.p1record = result3.id;
          } else if (this.p2 === result3.portfolio) {
            singlefund.comparision1 = result3.quantity;
            singlefund.p2record = result3.id;
          } else if (this.p3 === result3.portfolio) {
            singlefund.comparision2 = result3.quantity;
            singlefund.p3record = result3.id;
          }
        }

        // console.log(singlefund);
        this.fundlist.push(singlefund);
      }
      // console.log("------------");

    }
    console.log(this.fundlist);

  }

}
