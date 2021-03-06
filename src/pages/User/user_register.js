import React, {Component} from 'react'
import { Row, Col, Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Adduserform from './adduserform';
import $ from 'jquery';
import SessionManager from '../../factories/session_manage';
import API from '../../factories/api'
import Axios from 'axios';
import { BallBeat } from 'react-pure-loaders';
import { trls } from '../../factories/translate';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import 'datatables.net';
import * as Common from '../../factories/common';
import * as Auth from '../../factories/auth';
import Filtercomponent from '../../components/filtercomponent';
// import history from '../../history';
import * as authAction  from '../../actions/authAction';
import history from '../../history';
import Sweetalert from 'sweetalert';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    setUserType: (param) =>
            dispatch(authAction.userType(param)),
    blankdispatch: (blankFlag) =>
        dispatch(authAction.blankdispatch(blankFlag)),
});

class Userregister extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            userData:[],
            userUpdateData:[],
            loading:true,
            slideFormFlag: false,
            originFilterData: [],
            filterFlag: false,
            filterColunm: [
                {"label": 'UserName', "value": "userName", "type": 'text', "show": true},
                {"label": 'Email', "value": "Email", "type": 'text', "show": true},
                {"label": 'PhoneNumber', "value": "PhoneNumber", "type": 'text', "show": true},
                {"label": 'Active', "value": "active", "type": 'text', "show": true},
                {"label": 'Action', "value": "action", "type": 'text', "show": true},
                {"label": 'Login As', "value": "Login As", "type": 'text', "show": true},
            ],
            userInfo: Auth.getUserInfo(), 
            userType: '',
            showAllUser: false
        };
    }

    componentDidMount() {
        this._isMounted=true;
        this.getUserData();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentWillReceiveProps = nextProps => {
        this.setState({
            userType: nextProps.userType
        });
    };
    
    getUserData (data) {    
        this._isMounted = true;
        this.setState({loading: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetUserData+1, headers)
        .then(result => {
            Axios.get(API.GetUserData+result.data.totalCount, headers)
            .then(result => {
                if(this._isMounted){
                    if(!data){
                        this.setState({userData: result.data.data, originFilterData: result.data.data});
                    }else{
                        this.setState({userData: data});
                    }
                    this.setState({loading:false})
                    $('#example').dataTable().fnDestroy();
                    $('#example').DataTable(
                        {
                            "language": {
                                "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                                "zeroRecords": "Nothing found - sorry",
                                "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                                "infoEmpty": "No records available",
                                "infoFiltered": "(filtered from _MAX_ total records)",
                                "search": trls('Search'),
                                "paginate": {
                                  "previous": trls('Previous'),
                                  "next": trls('Next')
                                }
                            },
                              "searching": false,
                              "dom": 't<"bottom-datatable" lip>'
                          }
                      );
                }
            });
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login')
            }
        })
        
    }
    // filter module
    filterOptionData = (filterOption) =>{
        let dataA = []
        dataA = Common.filterData(filterOption, this.state.originFilterData);
        if(!filterOption.length){
            dataA=null;
        }
        $('#project_table').dataTable().fnDestroy();
        this.getUserData(dataA);
    }

    changeFilter = () => {
        if(this.state.filterFlag){
            this.setState({filterFlag: false})
        }else{
            this.setState({filterFlag: true})
        }
    }
    // filter module
    userUpdate = (id) => {
        var settings = {
            "url": API.GetUserDataById+id,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+Auth.getUserToken(),
        }
        }
        $.ajax(settings).done(function (response) {
        })
        .then(response => {
            this.setState({userUpdateData: response, mode:"update", slideFormFlag: true});
            Common.showSlideForm();
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login')
            }
        });
    }

    viewUserData = (event) => {
        this._isMounted = true;
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetUserDataById+event.currentTarget.id, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({userUpdateData: result.data})
                this.setState({modalShow:true, mode:"view", flag:true})
            }
        });
    }

    userDelete = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.delete("https://cors-anywhere.herokuapp.com/"+API.DeleteUserData+this.state.userId, headers)
        .then(result => {
            this.setState({loading:true})
            this.getUserData();               
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login')
            }
        });
    }

    userDeleteConfirm = (id) => {
        this.setState({userId: id})
        Sweetalert({
            title: "Are you sure?",
            text: trls("Are you sure to do this?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                this.userDelete();
            } else {
            }
        });
    }

    userActiveConfirm = (id, mode) => {
        confirmAlert({
            title: 'Confirm',
            message: 'Are you sure to do this.',
            buttons: [
              {
                label: mode==="active" ? 'Active': 'Deactive',
                onClick: () => {
                    if(mode==="active"){
                        this.activeUser(id);
                    }else{
                        this.deActiveUser(id);
                    }
                }
              },
              {
                label: 'Cancel',
                onClick: () => {}
              }
            ]
          });
    }

    addUser = () => {
        this.setState({mode:"add", flag:false, slideFormFlag: true})
        Common.showSlideForm();
    }

    removeColumn = (value) => {
        let filterColunm = this.state.filterColunm;
        filterColunm = filterColunm.filter(function(item, key) {
            if(item.label===value){
            item.show = false;
            }
            return item;
        })
        this.setState({filterColunm: filterColunm})
    }

    showColumn = (value) => {
        let filterColum = this.state.filterColunm;
        filterColum = filterColum.filter((item, key)=>item.label===value);
        return filterColum[0].show;
    }

    activeUser = (id) => {
        console.log('2222', id);
        var settings = {
            "url": API.PostActivateUser+id,
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+Auth.getUserToken(),
        }
        }
        $.ajax(settings).done(function (response) {
        })
        .then(response => {
            this.getUserData();    
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login')
            }
        });
    }

    deActiveUser = (id) => {
        var settings = {
            "url": API.PostDeaActivateUser+id,
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+Auth.getUserToken(),
        }
        }
        $.ajax(settings).done(function (response) {
        })
        .then(response => {
            this.getUserData();    
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login')
            }
        });
    }

    loginAsUser = (userName) => {
        var adminInfo = Auth.getUserInfo();
        this.props.setUserType("user");
        localStorage.setItem('admin_token', adminInfo.userToken);
        localStorage.setItem('admin_userName', adminInfo.userName);
        localStorage.setItem('admin_role', adminInfo.role);
        console.log("auth", this.props);
        var settings = {
            "url": API.PostLoginAsUser+userName,
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+Auth.getUserToken(),
            }
        }
        $.ajax(settings).done(function (response) {
        })
        .then(response => {
            localStorage.setItem('eijf_token', response.token);
            localStorage.setItem('eijf_userName', response.claims.UserName);
            localStorage.setItem('eijf_role', response.claims.Role);
            localStorage.setItem('userType', 'user');
            this.setState({userInfo : Auth.getUserInfo()});
            this.props.blankdispatch(this.props.blankFlag)
            history.push('/dashboard');
        })
        .catch(err => {
            if(err.response.status===401){
                history.push('/login');
            }
        });
    }

    render () {
        let userInfo = Auth.getUserInfo();
        const { filterColunm, userData, showAllUser } = this.state;
        let userDataList = [];
        if(!showAllUser){
            userDataList = userData.filter(item =>item.isActive===true);
        }else{
            userDataList = userData;
        }
        let filterData = [
            {"label": trls('UserName'), "value": "userName", "type": 'text'},
            {"label": trls('Email'), "value": "email", "type": 'text'},
        ]
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <h2 className="title">{trls('Users')}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            {Auth.getRole()==="Administrator" || Auth.getRole()==="Customer" ?(
                                <Button variant="primary" onClick={()=>this.addUser()}><i className="fas fa-plus add-icon"></i>{trls('Add_User')}</Button> 
                            ): <Button variant="primary" disabled onClick={()=>this.addUser()}><i className="fas fa-plus add-icon"></i>{trls('Add_User')}</Button> }
                            
                        </Col>
                        <Col sm={6} className="has-search">
                            <div style={{display: 'flex', float: 'right'}}>
                                <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>
                                <div style={{marginLeft: 20}}>
                                    <span className="fa fa-search form-control-feedback"></span>
                                    <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                                </div>
                            </div>
                        </Col>
                        {filterData.length&&(
                            <Filtercomponent
                                onHide={()=>this.setState({filterFlag: false})}
                                filterData={filterData}
                                onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                                showFlag={this.state.filterFlag}
                            />
                        )}
                    </Row>
                    <Col className="show-all_user">
                        <Form.Check type="checkbox" label={trls("Show All Users")} onChange={(evt)=>this.setState({showAllUser: evt.target.checked})}/>
                    </Col>
                    <div className="table-responsive credit-history">
                        <table id="example" className="place-and-orders__table table" width="99%">
                        <thead>
                            <tr>
                                {filterColunm.map((item, key)=>(
                                    <th className={!item.show ? "filter-show__hide" : ''} key={key}>
                                       {trls(item.label) ? trls(item.label) : ''}
                                        {/* <Contextmenu
                                            triggerTitle = {item.label}
                                            addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                            removeColumn = {(value)=>this.removeColumn(value)}
                                        /> */}
                                    </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        {userDataList && !this.state.loading &&(<tbody >
                            {
                                userDataList.map((data,i) =>(
                                    <tr id={i} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>{data.userName}</td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{data.email}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.phoneNumber}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>
                                            {data.isActive ? (
                                                <i className ="fas fa-check-circle active-icon"></i>
                                            ):
                                                <i className ="fas fa-check-circle inactive-icon"></i>
                                            }
                                        </td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''} style={{width: 300}}>
                                            <Row>
												{userInfo.role==="Administrator" ? (
                                                    <i className="fas fa-pen add-icon" onClick={()=>this.userUpdate(data.id)}><span className="action-title">{trls('Edit')}</span></i>
                                                ):
                                                    <i className="fas fa-pen add-icon__deactive"><span className="action-title">{trls('Edit')}</span></i>
                                                }
                                                
                                                {!data.isActive ? (
                                                    <i className="fas fa-check-circle add-icon" onClick={()=>this.userActiveConfirm(data.id, 'active')}><span className="action-title">{trls('Active')}</span></i>
                                                ):
                                                    <i className="fas fa-check-circle add-icon" onClick={()=>this.userActiveConfirm(data.id, 'deative')}><span className="action-title">{trls('Deactivate')}</span></i>
                                                }
											</Row>
                                        </td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''} style={{width: 150}}>
                                            <Row>
                                                {userInfo.role==="Administrator"? (
                                                    <i className="fas fa-eye add-icon" onClick={()=>this.loginAsUser(data.userName)}><span className="action-title">{trls('Login As')}</span></i>
                                                ):
                                                    <i className="fas fa-eye add-icon__deactive"><span className="action-title">{trls('Login As')}</span></i>
                                                }
											</Row>
                                        </td>
                                    </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                        { this.state.loading&& (
                            <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                                <BallBeat
                                    color={'#222A42'}
                                    loading={this.state.loading}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {this.state.slideFormFlag ? (
                    <Adduserform
                        show={this.state.modalShow}
                        mode={this.state.mode}
                        onHide={() => this.setState({slideFormFlag: false, userUpdateData: []})}
                        onGetUser={() => this.getUserData()}
                        userUpdateData={this.state.userUpdateData}
                    /> 
                ): null}
                
            </div>
        )
        };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Userregister);
