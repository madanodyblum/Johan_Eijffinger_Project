import React, {Component} from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from '../../factories/translate';
import * as authAction  from '../../actions/authAction';
import SessionManager from '../../factories/session_manage';
import * as Common from '../../factories/common';
import API from '../../factories/api'
import Axios from 'axios';
// import Select from 'react-select';
import Pageloadspiiner from '../../components/page_load_spinner';
import Sweetalert from 'sweetalert';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({
    blankdispatch: () =>
              dispatch(authAction.blankdispatch()),
});

class Patterncalculateform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        const { editPatternCalcuRow } = this.props;
        this.state = {  
            productSearch: [{'value': 'Description: Product with strokes', 'label': '7512-1'}, {'value': 'Product without strokes', 'label': '7513-1'}],
            rowId: editPatternCalcuRow.rowId ? editPatternCalcuRow.rowId : 0,
            rowDatas: editPatternCalcuRow.rowDatas ? editPatternCalcuRow.rowDatas : [],
            rowsVal: editPatternCalcuRow.rowsVal ? editPatternCalcuRow.rowsVal : [],
            rowLength: editPatternCalcuRow.rowLength ? editPatternCalcuRow.rowLength : [],
            calcRowLength: editPatternCalcuRow.calcRowLength ? editPatternCalcuRow.calcRowLength : [],
            totalLength: editPatternCalcuRow.totalLength ? editPatternCalcuRow.totalLength : 0,
            totalRowsLength: editPatternCalcuRow.totalRowsLength ? editPatternCalcuRow.totalRowsLength : 0,
            pageLodingFlag: false
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.props.blankdispatch();
    }

    handleSubmit = (event) => {
        this._isMounted = true;
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetUrl+'postRegistrationNumber', data, headers)
        .then(result => {
            this.props.onHide();
            this.props.onGetNumberData();
        })
    }

    onHide = () => {
        this.props.onHide() 
        this.props.blankdispatch();
    }

    handleAddRow = () => {
        let rowId = this.state.rowId;
        const item = {
          rowId: rowId
        };
        // if(!addRow){
            rowId += 1;
            this.setState({
                rowDatas: [...this.state.rowDatas, item],
                rowId: rowId
            });
            // this.setState({addnum:true, addRow: true});
        // }
    };

    changeRowsVal = (val, rowId) => {
        let rowsVal = this.state.rowsVal;
        rowsVal[rowId] = val;
        this.setState({rowsVal: rowsVal})
    }

    changeRowLength = (val, rowId) => {
        let rowLength = this.state.rowLength;
        let totalRowsLength = 0;
        rowLength[rowId] = val;
        rowLength.map((data, index)=>{
            totalRowsLength += data;
            return data;
        })
        this.setState({rowLength: rowLength, totalRowsLength: totalRowsLength})
    }

    getCalculateLength = (rowId) => {
        this._isMounted = true;
        this.setState({pageLodingFlag: true});
        const { orderLineNumber, itemData } = this.props;
        const { rowsVal, rowLength, rowDatas } = this.state;
        let totalLength = 0;
        let calcRowLength = this.state.calcRowLength;
        let params = {
            "data": [
                {
                  "line": orderLineNumber ? orderLineNumber : 0,
                  "rows": rowsVal[rowId],
                  "length": rowLength[rowId],
                  "pattern": itemData.U_DBS_PATROON ? itemData.U_DBS_PATROON : 0,
                  "patternType": itemData.U_DBS_VERSPRINGEND==="Y" ? "V" : "R"
                }
              ]
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.PostPatroonberekening, params, headers)
        .then(result => {
            if(this._isMounted){
                if(result.data.data[0]){
                    calcRowLength[rowId] = result.data.data[0].BenodigdeBaanLengte;
                    rowDatas.map((data, index)=>{
                        totalLength += rowsVal[data.rowId]*calcRowLength[data.rowId];
                        return data;
                    })
                    this.setState({calcRowLength: calcRowLength, totalLength: totalLength, pageLodingFlag: false})
                }
            }
        })
        // .catch(err => {
        //     if(err.response.status===401){
        //         history.push('/login')
        //     }
        // });
    }

    removeRow = (rowId) => {
        let rowDatas = this.state.rowDatas;
        const { rowsVal, calcRowLength, rowLength } = this.state;
        let totalLength = 0;
        let totalRowsLength = 0;
        rowDatas = rowDatas.filter((item, key)=>item.rowId!==rowId);
        rowDatas.map((data, index)=>{
            totalLength += rowsVal[data.rowId]*calcRowLength[data.rowId];
            totalRowsLength += parseFloat(rowLength[data.rowId])-1+1;
            return data;
        })
        this.setState({rowDatas: rowDatas, totalLength: totalLength, totalRowsLength: totalRowsLength})
    }

    submitTotalLength = (totalLength, patternCalcuRowData) => {
        let lengthVal = [];
        const{ patternRowId } = this.props;
        lengthVal = parseInt(totalLength);
        this.props.onHide();
        this.props.onSetQuantity(lengthVal, patternRowId, patternCalcuRowData);
        Common.hideSlideForm();
    }

    removeOrderLine = () => {
        const { patternRowId } = this.props;
        Sweetalert({
            title: "Are you sure?",
            text: trls("Pattern calculation needs to be filled for this product, do you want to delete the product from the order lines?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
                this.props.removeOrderLine(patternRowId);
                Sweetalert("Success!", {
                icon: "success",
              });
            } else {
            }
        });
    }

    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }

    changeCaculateCheck = (evt, rowId) => {
        let patternCheckFlag = this.state.patternCheckFlag;
        patternCheckFlag[0] = evt.target.checked;
        this.setState({patternCheckFlag: patternCheckFlag})
    }
    
    render(){
        const { orderLineNumber, itemCode, itemData, patternRowLengthCalcFlag, editPatternCalcuRow } = this.props;
        const { rowId, rowDatas, calcRowLength, rowsVal, rowLength, totalLength, pageLodingFlag, totalRowsLength } = this.state;
        let editPatternCalcuData = [];
        editPatternCalcuData.rowId = rowId;
        editPatternCalcuData.rowDatas = rowDatas;
        editPatternCalcuData.calcRowLength = calcRowLength;
        editPatternCalcuData.rowLength = rowLength;
        editPatternCalcuData.rowsVal = rowsVal;
        editPatternCalcuData.totalLength = totalLength;
        editPatternCalcuData.totalRowsLength = totalRowsLength;
        return (
            <div className = "slide-form__controls open" style={{height: "100%"}}>
                <div style={{marginBottom:30}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=> editPatternCalcuRow.rowId ? this.onHide() : this.removeOrderLine()}></i>
                </div>
                <Row>
                    <Col sm={12}>
                        <Form className="container product-form" onSubmit = { this.handleSubmit }>
                            <Form.Group as={Row} controlId="email">
                                <Form.Label column sm="3">
                                    {trls('Pattern_calculation')}   
                                </Form.Label>
                                <Col sm="9" className="product-text place-pattern__form">
                                    <Form.Control type="text" name="role" className="input-text" disabled defaultValue={orderLineNumber} required placeholder={trls('OrderNumber')} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="email">
                                <Form.Label column sm="3">
                                    {trls('ItemCode')}   
                                </Form.Label>
                                <Col sm="9" className="product-text place-pattern__form">
                                    <Form.Control type="text" name="role" className="input-text"  disabled defaultValue={itemCode} required placeholder={trls('Order_rule')} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="email">
                                <Form.Label column sm="3">
                                    {trls('Pattern')}   
                                </Form.Label>
                                <Col sm="9" className="product-text place-pattern__form">
                                    <Form.Control type="text" name="role" className="input-text" disabled defaultValue={itemData.U_DBS_PATROON} required placeholder={trls('Pattern')} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="email">
                                <Col>
                                    <Form.Check type="checkbox" defaultChecked={itemData.U_DBS_VERSPRINGEND==="Y" ? true : false} label={trls('Staggered')} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="email">
                                <Col>
                                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                        <thead>
                                            <tr>
                                                <th>{trls("Rows")}</th>
                                                <th>{trls("Row_length")}</th>
                                                <th>{trls("Row_length_calculated")}</th>
                                                <th>{trls("Total_row_length")}</th>
                                                <th>{trls("NoPatternCalculation")}</th>
                                                <th>{trls("Action")}</th>
                                            </tr>
                                        </thead>
                                        {rowDatas &&(<tbody>
                                            {
                                                rowDatas.map((data,index) =>(
                                                <tr id={index} key={index}>
                                                    <td><Form.Control type="number" name="rows" required placeholder={trls('Rows')} value={rowsVal[data.rowId] ? rowsVal[data.rowId] : ''} onChange={(evt)=>this.changeRowsVal(evt.target.value, data.rowId)}/></td>
                                                    <td>
                                                        {!patternRowLengthCalcFlag ? (
                                                            <Form.Control type="number" name="rows" step="0.01" required  placeholder={trls('Row_length')} value={rowLength[data.rowId] ? rowLength[data.rowId] : ''} onChange={(evt)=>this.changeRowLength(evt.target.value, data.rowId)} onBlur={()=>this.getCalculateLength(data.rowId)}/>
                                                        ): 
                                                            <Form.Control type="number" name="rows" step="0.01" required  placeholder={trls('Row_length')} value={rowLength[data.rowId] ? rowLength[data.rowId] : ''} onChange={(evt)=>this.changeRowLength(evt.target.value, data.rowId)}/>
                                                        }
                                                    </td>
                                                    <td>{calcRowLength[data.rowId] ? Common.formatNumber(calcRowLength[data.rowId]) : 0}</td>
                                                    <td>{calcRowLength[data.rowId] ? Common.formatNumber(rowsVal[data.rowId]*calcRowLength[data.rowId]) : 0}</td>
                                                    <td>
                                                        <Form.Check type="checkbox" onChange={(evt)=>this.changeCaculateCheck(evt, data.rowId)}/>
                                                    </td>
                                                    <td>
                                                        <Row style={{justifyContent: "space-around"}}>
                                                            <i className="fas fa-trash-alt add-icon" onClick = {()=>this.removeRow(data.rowId)}></i>
                                                        </Row>
                                                    </td>
                                                </tr>
                                            ))
                                            }
                                        </tbody>)}
                                    </table>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col sm="4" className="product-text input-div">
                                    <Button variant="light" onClick={()=>this.handleAddRow()}><i className="fas fa-plus add-icon"></i>{trls('Add_to_row')}</Button>
                                </Col>
                                <Col sm={8} style={{float: 'right', paddingLeft: 0, paddingRight: 0}}>
                                    <div className="info-block pattern-total__length">
                                        <span className="txt-bold">{trls('Total_lengh')}</span>
                                        {patternRowLengthCalcFlag ? (
                                            <span>{totalRowsLength ? Common.formatNumber(totalRowsLength): 0.00}</span>
                                        ):
                                            <span>{totalLength ? Common.formatNumber(totalLength): 0.00}</span>
                                        }
                                    </div>
                                    {patternRowLengthCalcFlag ? (
                                        <Button type="button" className="place-submit__order" disabled={rowDatas.length===0 ? true : false} onClick={()=>this.submitTotalLength(totalRowsLength, editPatternCalcuData)}>Submit</Button>
                                    ):
                                        <Button type="button" className="place-submit__order" disabled={rowDatas.length===0 ? true : false} onClick={()=>this.submitTotalLength(totalLength, editPatternCalcuData)}>Submit</Button>
                                    }
                                </Col>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Pageloadspiiner loading = {pageLodingFlag}/>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Patterncalculateform);