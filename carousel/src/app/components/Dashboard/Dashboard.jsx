import React from 'react';

import conf from '../../../config/environment';
import ProgressRing from '../ProgressRing/ProgressRing';
import bemHelper from '../../utils/bem';
import fetch from '../../utils/fetch';

import './dashboard.scss';

const cn = bemHelper({ block: 'dashboard' });

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.renderPage = this.renderPage.bind(this);
    this.onPaginate = this.onPaginate.bind(this);

    this.state = {
      data: null,
      percentage: 0,
      page: 0,
      loaded: false,
    };
  }

  getData() {
    if (this.state.loaded) return;
    this.setState({ loaded: true });

    let url = process.env.api ? `${process.env.api.host}/creditReportInfo.json` : `${conf.api.host}/creditReportInfo.json`;
    const json = fetch.getJSON(url);

    json.then(data => {
      const info = data.creditReportInfo;

      this.setState({
        data,
        percentage: Math.round(((info.score - info.minScoreValue) * 100) / (info.maxScoreValue - info.minScoreValue)),
        page: 1
      });
    });

    // Due to limited Internet availability, the JSON got hardcoded here for dev/testing purposes
    // const data = {
    //   "accountIDVStatus": "PASS",
    //   "creditReportInfo": {
    //     "score": 514,
    //     "scoreBand": 4,
    //     "clientRef": "CS-SED-655426-708782",
    //     "status": "MATCH",
    //     "maxScoreValue": 700,
    //     "minScoreValue": 0,
    //     "monthsSinceLastDefaulted": -1,
    //     "hasEverDefaulted": false,
    //     "monthsSinceLastDelinquent": 1,
    //     "hasEverBeenDelinquent": true,
    //     "percentageCreditUsed": 44,
    //     "percentageCreditUsedDirectionFlag": 1,
    //     "changedScore": 0,
    //     "currentShortTermDebt": 13758,
    //     "currentShortTermNonPromotionalDebt": 13758,
    //     "currentShortTermCreditLimit": 30600,
    //     "currentShortTermCreditUtilisation": 44,
    //     "changeInShortTermDebt": 549,
    //     "currentLongTermDebt": 24682,
    //     "currentLongTermNonPromotionalDebt": 24682,
    //     "currentLongTermCreditLimit": null,
    //     "currentLongTermCreditUtilisation": null,
    //     "changeInLongTermDebt": -327,
    //     "numPositiveScoreFactors": 9,
    //     "numNegativeScoreFactors": 0,
    //     "equifaxScoreBand": 4,
    //     "equifaxScoreBandDescription": "Excellent",
    //     "daysUntilNextReport": 9
    //   },
    //   "dashboardStatus": "PASS",
    //   "personaType": "INEXPERIENCED",
    //   "coachingSummary": {
    //     "activeTodo": false,
    //     "activeChat": true,
    //     "numberOfTodoItems": 0,
    //     "numberOfCompletedTodoItems": 0,
    //     "selected": true
    //   },
    //   "augmentedCreditScore": null
    // };
    //
    // const info = data.creditReportInfo;
    // const percentage = Math.round(((info.score - info.minScoreValue) * 100) / (info.maxScoreValue - info.minScoreValue));
    // const page = 1;
    //
    // this.setState({
    //   data,
    //   percentage,
    //   page,
    // });
  }

  onPaginate(page = 0) {
    this.setState({ page });
  }

  renderPage() {
    const { page, data } = this.state;
    const paginator = (
      <div className={cn('paginator')}>
        <ul>
          <li className={page === 1 ? 'active' : ''} onClick={() => this.onPaginate(1)}></li>
          <li className={page === 2 ? 'active' : ''} onClick={() => this.onPaginate(2)}></li>
          <li className={page === 3 ? 'active' : ''} onClick={() => this.onPaginate(3)}></li>
          <li className={page === 4 ? 'active' : ''} onClick={() => this.onPaginate(4)}></li>
        </ul>
      </div>
    );
    const locNum = (number) => Number(number).toLocaleString('en-GB');

    if (!data) {
      this.getData();
      return (<div className={cn('bubble-content')}>
        <p className={cn('bubble-subtitle')}>Waiting for your information...</p>
      </div>);
    }

    const info = data.creditReportInfo;

    switch(page) {
      case 1:
        return (
          <div className={cn('bubble-content')}>
            <p className={cn('bubble-subtitle')}>Your credit score is</p>
            <h2 className={cn('bubble-title')}>{info.score}</h2>
            <p className={cn('bubble-subtitle')}>out of <strong>{info.maxScoreValue}</strong></p>
            <p className={cn('bubble-info')}>Soaring high</p>
            { paginator }
          </div>
        );
      case 2:
        return (
          <div className={cn('bubble-content')}>
            <p className={cn('bubble-subtitle')}>Your short term debt total</p>
            <h2 className={cn('bubble-title')}>£{locNum(info.currentShortTermDebt || 0)}</h2>
            <p className={cn('bubble-subtitle')}>Total credit limit <strong>£{locNum(info.currentShortTermCreditLimit || 0)}</strong></p>
            { info.changeInShortTermDebt &&
              <p className={cn('bubble-info')}>Change from last month: {info.changeInShortTermDebt}</p>
            }
            { !info.changeInShortTermDebt &&
              <p className={cn('bubble-info')}>No change from last month</p>
            }
            { paginator }
          </div>
        );
      case 3:
        return (
          <div className={cn('bubble-content')}>
            <p className={cn('bubble-subtitle')}>Your long term debt total</p>
            <h2 className={cn('bubble-title')}>£{locNum(info.currentLongTermDebt || 0)}</h2>
            <p className={cn('bubble-subtitle')}>Total credit limit <strong>£{locNum(info.currentLongTermCreditLimit || 0)}</strong></p>
            { info.changeInLongTermDebt &&
              <p className={cn('bubble-info')}>Change from last month: {info.changeInLongTermDebt}</p>
            }
            { !info.changeInLongTermDebt &&
              <p className={cn('bubble-info')}>No change from last month</p>
            }
            { paginator }
          </div>
        );
      case 4:
        return (
          <div className={cn('bubble-content')}>
            <p className={cn('bubble-subtitle')}>Credit used</p>
            <h2 className={cn('bubble-title')}>{info.percentageCreditUsed}%</h2>
            { paginator }
          </div>
        );
      default:
        return (<div className={cn('bubble-content')}>
          <p className={cn('bubble-subtitle')}>Waiting for your information...</p>
          { data && paginator }
        </div>);
    }
  }

  render() {
    const { data, page, percentage } = this.state;
    const info = data ? data.creditReportInfo : { percentageCreditUsed: 0 };
    let progress = 0;

    if (page === 1) progress = percentage;
    else if (page === 4) progress = info.percentageCreditUsed;

    return (
      <div className={cn('wrapper')}>
        <div className={cn('content')}>
          <div className={cn(['frosted', 'lg-bubble'])}>
            <ProgressRing
              radius={250}
              stroke={4}
              progress={progress}
              color='#a4e1eb'
              className='progress-ring'
            />
            { this.renderPage() }
          </div>
          <div className={cn(['frosted', 'sm-bubble'])}>
            <div className={cn('bubble-content')}>
              <h2 className={cn('bubble-title')}>?</h2>
              <p className={cn('bubble-subtitle')}>New offers</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
