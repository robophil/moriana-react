import React from 'react'
import PropTypes from 'prop-types'
import { displayItemName, searchItems } from 'items'
import SearchDrop from 'search-drop'
import EditTransactionsTable from 'edit-transactions-table'
import EditBatch from 'edit-batch'
import EditTransferBatch from 'edit-transfer-batch'
import NewItem from 'new-item'

export default class EditTransactions extends React.Component {
  state = {
    showBatchEdit: false,
    showNewItem: false,
    editingItem: '',
    editingCategory: '',
    editingBatch: null,
    editingIndex: null,
    editingTransactions: []
  }

  toggleNewBatch = (value) => {
    this.setState({ editingItem: value.item, editingCategory: value.category, showBatchEdit: true })
  }

  hideEditBatch = () => {
    this.setState({
      editingItem: null,
      editingCategory: null,
      editingBatch: null,
      editingIndex: null,
      showBatchEdit: false,
      editingTransactions: []
    })
  }

  toggleNewItem = (name) => {
    this.setState({ editingItem: name, showNewItem: true })
  }

  closeNewItem = () => {
    this.setState({ showNewItem: false })
  }

  newItemSelected = (item, category) => {
    this.setState({ showNewItem: false })
    this.toggleNewBatch({item, category})
  }

  transactionEditClick = (index) => {
    const {transactions, shipmentType} = this.props
    const {item, category, quantity, expiration, lot, unitPrice} = transactions[index]
    let editingTransactions = []
    if (shipmentType !== 'receive') {
      editingTransactions = transactions.filter(t => t.item === item && t.category === category)
    }
    this.setState({
      editingItem: item,
      editingCategory: category,
      editingBatch: { quantity, expiration, lot, unitPrice },
      editingIndex: Number(index),
      showBatchEdit: true,
      editingTransactions,
    })
  }

  updateTransaction = (value) => {
    if (this.state.editingIndex !== null) {
      value.index = this.state.editingIndex
    }
    this.props.updateShipment('transaction', value)
  }

  deleteTransaction = () => {
    this.props.updateShipment('transaction', {delete: true, index: this.state.editingIndex})
  }

  onSubmit = (event) => {
    if (event) event.preventDefault()
  }

  render () {
    const { items, itemsLoading, categories, transactions, shipmentType } = this.props
    const {
      editingItem,
      editingCategory,
      editingBatch,
      editingTransactions,
      showBatchEdit,
      showNewItem
    } = this.state
    const emptyItem = {}
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <SearchDrop
            rows={items}
            loading={itemsLoading}
            value={emptyItem}
            valueSelected={this.toggleNewBatch}
            onNewSelected={this.toggleNewItem}
            label={'Search Items'}
            resourceName={'Item'}
            displayFunction={displayItemName}
            searchFilterFunction={searchItems}
            // autoFocus={isNew}
            className='search-items'
          />
        </form>
        <EditTransactionsTable
          transactions={transactions}
          onEditClick={this.transactionEditClick}
        />
        {showBatchEdit && shipmentType === 'receive' && (
          <EditBatch
            item={editingItem}
            category={editingCategory}
            batch={editingBatch}
            valueUpdated={this.updateTransaction}
            deleteClicked={this.deleteTransaction}
            closeClicked={this.hideEditBatch}
          />
        )}
        {showBatchEdit && shipmentType !== 'receive' && (
          <EditTransferBatch
            item={editingItem}
            category={editingCategory}
            batch={editingBatch}
            valueUpdated={this.updateTransaction}
            deleteClicked={this.deleteTransaction}
            transactions={editingTransactions}
            closeClicked={this.hideEditBatch}
            getStockForEdit={this.props.getStockForEdit}
            stock={this.props.stock}
            dbName={this.props.dbName}
            currentLocationName={this.props.currentLocationName}
            date={this.props.date}
          />
        )}
        {showNewItem && (
          <NewItem
            value={editingItem}
            closeClicked={this.closeNewItem}
            valueUpdated={this.newItemSelected}
            categories={categories}
          />
        )}
      </div>
    )
  }
}

EditTransactions.propTypes = {
  dbName: PropTypes.string.isRequired,
  currentLocationName: PropTypes.string.isRequired,
  shipmentType: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  itemsLoading: PropTypes.bool.isRequired,
  transactions: PropTypes.array.isRequired,
  updateShipment: PropTypes.func.isRequired,
  getStockForEdit: PropTypes.func.isRequired,
  stock: PropTypes.array.isRequired,
  date: PropTypes.string.isRequired
}
