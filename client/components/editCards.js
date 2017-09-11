import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import BackendApi from '../utils/backendApi'
import Input from 'react-toolbox/lib/input';
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';
import { Button } from 'react-toolbox/lib/button'

const ItemsPerPage = 5;

class EditCards extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            filteredCards: [],
            records: [],
            pages: [],
            page: 0,
            filter: '',
            selected: []
        };

        this.getCards(props);
    }

    getFilteredCards(cards, filter) {

        let filteredCards = cards;

        if (filter) {
            let filterLowercase = filter.toLowerCase();
            filteredCards = cards.filter(card => card.source.toLowerCase().includes(filterLowercase) ||
                card.target.toLowerCase().includes(filterLowercase) ||
                card.comment.toLowerCase().includes(filterLowercase));
        }

        return filteredCards;
    }

    getPages(state) {

        const pageCount = Math.ceil(state.filteredCards.length/ItemsPerPage);

        let pages;

        if (pageCount < 5) {
            pages = Array.from(new Array(pageCount).keys())
        } else {
            pages = [];
            pages.push(0);
            if (state.page > 1) {
                pages.push(state.page-1);
            }
            if (state.page > 0) {
                pages.push(state.page);
            }
            if (state.page + 1 < pageCount-1) {
                pages.push(state.page+1);
            }
            if (state.page < pageCount-1) {
                pages.push(pageCount-1);
            }
        }

        return pages;
    }

    getRecords(page, state) {
        const start = page * ItemsPerPage;
        let end = start + ItemsPerPage;
        if (end > state.filteredCards.length) {
            end = state.filteredCards.length;
        }
        return state.filteredCards.slice(start, end);
    }

    async getCards(props) {

        const cards = await BackendApi.getCards(props.setId);

        const state = {
            cards,
            page: 0,
            selected: [],
            filteredCards: this.getFilteredCards(cards, this.state.filter)
        };

        state.pages = this.getPages(state);
        state.records = this.getRecords(0, state);

        this.setState(state);
    }

    async deleteCards() {

        for (let id in this.state.selected) {
            await BackendApi.deleteCard(id);
        }

        await this.getCards(this.props);
    }

    selectCard(selected) {
        this.setState({selected: selected.map(item => this.state.filteredCards[item].id)})
    }

    setFilter(filter) {

        const state = {
            filteredCards: this.getFilteredCards(this.state.cards, filter),
            filter,
            page: 0
        };

        state.records = this.getRecords(0, state);
        state.pages = this.getPages(state);

        this.setState(state);
    }

    setPage(page) {

        const state = {
            records: this.getRecords(page, this.state),
            page,
            filteredCards: this.state.filteredCards
        };

        state.pages = this.getPages(state);

        this.setState(state);
    }

    renderBody() {

        return <div className="settings">

            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item"><a href={'#/settings/set/'+this.props.selectedSet.id}>{this.props.selectedSet.name}</a></div>
                <div className="item">Edit Cards</div>
            </div>

            <h2>Edit Cards</h2>

            <div className="filter">

                <Input
                    type="text"
                    label={<span style={{ fontSize: '0.8em' }}>Filter</span>}
                    style={{ fontSize: '1em', width: '100%' }}
                    value={this.state.filter}
                    onChange={value => this.setFilter(value)}
                />
            </div>

            <Table onRowSelect={selected => this.selectCard(selected)} multiSelectable>
                <TableHead>
                    <TableCell>Source</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Comment</TableCell>
                </TableHead>

                {this.state.records.map(card => (<TableRow selected={this.state.selected.indexOf(card.id) !== -1} key={card.id}>
                    <TableCell>{card.source}</TableCell>
                    <TableCell>{card.target}</TableCell>
                    <TableCell>{card.comment}</TableCell>
                </TableRow>))}

            </Table>

            {this.state.pages.length > 1 ? <ul className="paging">
                {this.state.pages.map(page => {
                    const selected = page === this.state.page;
                    return <li key={page} className={selected ? ' selected' : ''} onTouchTap={() => { if (!selected) this.setPage(page) }}>
                        {page+1}
                </li>; })}
            </ul> : null}

            <div>{this.state.selected.length ? <Button
                    label="Delete selected"
                    onTouchTap={() => this.deleteCards()}
                    raised
                    style={{ fontSize: '1em', width: '100%', marginTop: '1em' }}
                />
                : null }</div>
        </div>;
    }

    render() {
        return (<div className="settings">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({set}, props) => {

    let {setId} = props.routeParams;
    let sets = set.get('sets');

    let selectedSet = sets.find(set => set.id === setId) || {};

    return {
        selectedSet,
        setId
    };
};

export default connect(mapStateToProps)(withRouter(EditCards));
