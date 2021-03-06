import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from '../../factories/translate';
import "react-datepicker/dist/react-datepicker.css";

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Shippingaddressform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
    }

    handleSubmit = (event) => {
        let shippingAddress = this.props.shippingAddress;
        this._isMounted = true;
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        shippingAddress.hasOwnProperty("id") ? shippingAddress.address = data.address: shippingAddress.Street = data.address;
        shippingAddress.hasOwnProperty("id") ? shippingAddress.city = data.city: shippingAddress.City = data.city;
        shippingAddress.hasOwnProperty("id") ? shippingAddress.zipCode = data.zipCode: shippingAddress.ZipCode = data.zipCode;
        this.props.setShippingAddress(shippingAddress);
        this.props.onHide();
    }

    render(){
        const { shippingAddress } = this.props;
        return (
            <Modal
                show={this.props.show}
                onHide={()=>this.props.onHide()}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Shipping_Address')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="address" defaultValue={shippingAddress.hasOwnProperty("id") ? shippingAddress.address: shippingAddress.Street} required placeholder={trls('Street')}/>
                            <label className="placeholder-label">{trls('Street')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="zipCode" defaultValue={shippingAddress.hasOwnProperty("id") ? shippingAddress.zipCode : shippingAddress.ZipCode} required placeholder={trls('Zipcode')}/>
                            <label className="placeholder-label">{trls('Zipcode')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="city" defaultValue={shippingAddress.hasOwnProperty("id") ? shippingAddress.city : shippingAddress.City} required placeholder={trls('City')}/>
                            <label className="placeholder-label">{trls('City')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="Submit" style={{width: "10%"}}>{trls("Save")}</Button>
                    </Form.Group>
                </Form>    
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Shippingaddressform);