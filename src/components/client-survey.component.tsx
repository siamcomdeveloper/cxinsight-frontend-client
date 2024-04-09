import React from 'react';
import * as toastr from 'toastr';
import Surveys from '../models/surveys';
import BaseService from '../service/base.service';
import { History } from 'history';
import jwt from 'jsonwebtoken';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Progress from 'antd/lib/progress';
// import qs from 'querystring';

import '../css/responseweb-base-bundle-min.d03455d7.css';
import '../css/smlib.surveytemplates-survey_page-bundle-min.74c6465c.css';
import '../css/palette-1_471b9133-d1b8-4b9d-8978-e48ff77e3f70.css';
import '../css/wds-react.4_16_1.min.css';

import SurveyResponse from '../models/surveyResponse';
import Answer from '../models/answers';
import Question from '../models/questions';
import RatingQuestion from '../common/client-survey/ratingQuestion';
import ReactDOM from 'react-dom';
import ChoiceQuestion from '../common/client-survey/choiceQuestion';
import ScoreQuestion from '../common/client-survey/scoreQuestion';
import TextQuestion from '../common/client-survey/textQuestion';
import CheckboxQuestion from '../common/client-survey/checkboxQuestion';
import DropdownQuestion from '../common/client-survey/dropdownQuestion';

import Email from '../models/email';
import moment from 'moment';
import parse from 'html-react-parser';
import reactCSS from 'reactcss';

// import Recaptcha from 'react-recaptcha';

interface IProps { 
    history: History;
    match:{ 
        isExact: boolean
        params: {
            xSite: string
        },
        path: string,
        url: string,
    }
}
interface IState {
    xSite: any,
    survey: Surveys,
    surveyResponse: SurveyResponse,

    isLoading: boolean, // for showing the Loading icon.
    isChecking: boolean, // for showing the Google Recaptcha.
    // RecaptchaResponse: any, 
    isSuccessLoading: boolean, // for showing the survey when passed the Google Recaptcha.
    
    thankyou : boolean, // for showing the Thank you text.
    submitLoading: boolean, // for showing the Submit Loading icon.

    nodeElement: any; // question elements for the survey
    currentPageNo: number;
    disableElement: any; // boolean status of the disable question number (skip questions on the survey)
    numQuestion: number; // number of questions on the survey
    numPage: number; // number of pages on the survey

    questionId: any; // id of questions on the survey
    questionTypeId: any; // id of questions on the survey
    questionRequired: any; // boolean status of required questions on the survey
    
    questionAnalyzeEntity: any; // boolean status of analyze entity questions on the survey
    questionAnalyzeSentiment: any; // boolean status of analyze sentiment questions on the survey
    
    questionShowCommentFieldWhenAnswers: any; // boolean status of questions which need to show a comment field when client answers on the survey
    showCommentFieldStatus: any; // boolean status of questions to show a comment field on the survey
    showConsentSection: any; // boolean status of questions to show a consent section on the survey

    answer: any; // contains the client answer(s) for each question
    answerInfo: any; // contains the each question client answer(s) on the client info section
    comment: any; // contains the client comment answer(s) for each question

    signature: any; // contains the client signature (image) for the consent question
    consent: any; // contains the client consent signature (image) for the consent question

    skipLogicStatus: any; // boolean status of question(s) that has a skip logic
    skipLogic: any; // array of skip logic data of question(s) on the survey
    skipLogicText: any; // array of skip logic display text of question(s) on the survey

    requiredLabelStatus: any; // boolean status to show required label text for the question(s) on the survey
    requiredLabelStatusInfo: any; // boolean status to show required label text for the client info question(s) on the survey
    requiredValidLabelStatusInfo : any; // boolean status to show required label text for the client info question(s) on the survey
    
    callAnswerApi: any; // boolean status to check whether the answer(s) is already record into the database or not

    htmlElRef: any; // Store html ref (position) of the question element(s) on the page to scroll to the question.
    htmlElRefInfo: any; // Store html ref (position) of the client info question element(s) on the page to scroll to the question.

    responseId: any;
    timeSpent: any;

    authorized: any;
    cutoffDue: any;

    surveyId: any;
    collectorId: any;

    email_id: any; // from the client data 
    sms_id: any; // from the client data 

    surveyName: any;
    headerDescription: any;
    footerDescription: any;
    endOfSurveyMessage: any;
    completionRedirect: any;

    lang: any; // Store the language value : 0 = Primary language (TH or EN), 1 = Secondary laugage (EN)
    langModalVisible: any; // for showing the language modal for the multiple language survey.

    // isMobile: boolean; // mobile device detect for the realasset client to redirectlink to realapp

    clientInfoNum: any; // Number of the client info form flieds
    customerId: any; // Store customer id when the client come to this survey from email or sms link

    oneTrustConsentForm: any; // Onetrust purposes
    OneTrustConsentProcess: any; // Is Singha consent form

    rp: any; // for using the survey data all the whole file
    clientData : any; // for using the client data all the whole file (jwt.decode(jwtToken))

    sumAnswer: any;
}

// full page container styles
const containerStyles = {
    overflow: 'auto',
    height: '100vh',
}

/** 
 * export default class ClientSurvey extends React.Component<IProps, IState>
 * 
 * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
 * 
 * Summary the function: 
 * 
 *     Client Survey
 * 
 * Extends     :   React.Component
 * 
 * Interface   :   IProps,
 *                 IState
 */
export default class ClientSurvey extends React.Component<IProps, IState> {
    // for scroll to any element position on the page
    container: any;

    constructor(props: IProps) {

        super(props);

        this.state = {
            xSite: '',
            survey: {
                name: '',
            },
            surveyResponse:{
                survey_id: '',
                collector_id: '',
                time_spent: '', 
                complete_status: 0
            },
            isLoading: true,
            isChecking: true,
            // RecaptchaResponse: '',
            isSuccessLoading: false,
            submitLoading: false,
            thankyou: false,
            
            nodeElement: [],
            currentPageNo: 1,
            disableElement: [],
            numQuestion: 0,
            numPage: 1,
            questionId: [],
            questionTypeId: [],
            questionRequired: [],
            questionAnalyzeEntity: [],
            questionAnalyzeSentiment: [],
            questionShowCommentFieldWhenAnswers: [],
            showCommentFieldStatus: [],
            showConsentSection: [],
            answer: [],
            answerInfo: [],
            comment: [],
            signature: [],
            consent: [],
            skipLogicStatus: [],
            skipLogic: [],
            skipLogicText: [],
            requiredLabelStatus: [],
            requiredLabelStatusInfo: [],
            requiredValidLabelStatusInfo: [],

            callAnswerApi: [],
            htmlElRef: [],
            htmlElRefInfo: [],

            responseId: '',
            timeSpent: 0,

            authorized: false,
            cutoffDue: false,
            surveyId: 0,
            collectorId: 0,
            email_id: 0,
            sms_id: 0,

            surveyName: '',
            headerDescription: [],
            footerDescription: [],
            endOfSurveyMessage: '',
            completionRedirect: '',

            lang: 0,
            langModalVisible: false,

            // isMobile: window.outerWidth <= 575 ? true : false,
            clientInfoNum: 11,
            customerId: '',

            oneTrustConsentForm: [],
            OneTrustConsentProcess: false,

            rp: [],
            clientData: [],

            sumAnswer: 0
        }

        // Bind function to call the this.state statment inside the functions
        this.onFieldValueChange = this.onFieldValueChange.bind(this);
        this.answerHandler = this.answerHandler.bind(this);
        this.answerInfoHandler = this.answerInfoHandler.bind(this);
        this.commentHandler = this.commentHandler.bind(this);
        this.signatureHandler = this.signatureHandler.bind(this);
        this.consentHandler = this.consentHandler.bind(this);
    }

    /** 
     * componentDidMount()
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Do this function when client visits this page (Initial)
     * 
     */
    componentDidMount() {
        console.log('componentDidMount');
        this.renderSurvey();
    }

    /** 
     * passRecaptcha()
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Get the survey data when pass Google ReCaptcha
     * 
     */
    renderSurvey(){
        // Set html body id to "client-survey" to get the page style from css
        document.body.id = 'client-survey';
        // Set html body class to "translate survey-body modern-browser" to get the page style from css
        document.body.classList.toggle('translate', true);
        document.body.classList.toggle('survey-body', true);
        document.body.classList.toggle('modern-browser', true);
        
        console.log(this.props.history.location);
        console.log(this.props.history.location.search);
        console.log(this.props.history.location.search.replace('?', ''));

        const paramTk = this.props.history.location.search.replace('?', '').split("=")[1];
        const paramToken = '';
        console.log(paramTk);
        console.log(paramToken);
        // Get the client token key (JWT or Base64) from url
        // const query = qs.parse(this.props.history.location.search.replace('?', ''));
        // console.log('query', query);
        
        // const paramTk = query.tk as any;
        // const paramToken = query.token as any;

        // console.log(paramTk);
        // console.log(paramToken);

        // Exit if not found the token key as a param
        if(!paramTk && !paramToken) return;

        let jwtToken;
        if(paramTk){
            const bufferBase64 = Buffer.from(paramTk, 'base64');
            jwtToken = bufferBase64.toString();
        }
        else{
            jwtToken = paramToken;
        }

        const clientData = jwt.decode(jwtToken) as any;
        if(!clientData) return;
        
        console.log('clientData', clientData);

        // Get all the survey data
        BaseService.get<Surveys>(this.props.match.params.xSite, '/surveys/client/', clientData.survey_id + '/' + clientData.collector_id).then(
            async (rp) => {
                try{
                    if (rp.Status) {

                        console.log(rp);

                        this.setState({
                            isLoading: false,
                            rp: rp,
                            clientData: clientData
                        }, () => { 
                            this.getSurveyData(this.state.rp, this.state.clientData);
                        });
                        

                    } else {
                        toastr.error('Something went wrong!, please refresh the page or try again later.');
                        BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey componentDidMount else ${clientData}`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                    }
                } catch(error){
                    console.log('error', error);
                    toastr.error('Something went wrong!, please refresh the page or try again later.');
                    BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey componentDidMount catch ${clientData}`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                }
            });
    }

    /** 
     * getSurveyData(rp: any, clientData: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     get the survey data
     * 
     * Parameters   :   rp: Object (Response from api)
     *                  clientData: Object (from JWT)
     */
    getSurveyData(rp: any, clientData: any){
        
        this.setState({ isLoading: true });

        // const query = qs.parse(this.props.history.location.search.replace('?', ''));
        const collectorStatus = rp.Data.recordset[0].collector_status;
        const isCutoff = rp.Data.recordset[0].cutoff;
        const cutoff = rp.Data.recordset[0].cutoff_datetime;
        const weblinkRedo = rp.Data.recordset[0].collect_option ? parseInt(rp.Data.recordset[0].collect_option) : 0;
        const weblinkNotRedoInDay = rp.Data.recordset[0].no_send_in_day;

        if(rp.Data.recordset[0].enable_consent_date){
            clientData.consent_date = moment();
        } else {
            clientData.consent_date = '';
        }
        
        // Showing the not authorized text to the client
        if(collectorStatus !== 2){
            this.setState({
                survey: rp.Data.recordset[0],
                authorized: false,
                isLoading: false,
            });

            return; 
        }

        // Check the cut off date and show the cut off due text to the client
        if(isCutoff && cutoff){

            const currentDatetime = moment().format('YYYY-MM-DD HH:mm:ss');

            const cutoffDatetime = cutoff ? moment(cutoff).format('YYYY-MM-DD HH:mm:ss') : '';

            if(moment(currentDatetime).isSameOrAfter(cutoffDatetime)) { 
                
                this.setState({
                    survey: rp.Data.recordset[0],
                    authorized: true,
                    cutoffDue: true,
                    isLoading: false,
                });

                return; 
            }
        }
        
        const numQuestion = parseInt(rp.Data.recordset[0].num_question)
        const numPage = parseInt(rp.Data.recordset[0].num_page)

        let nodeArr = new Array<any>(numQuestion);
        let disableArr = new Array<any>(numQuestion);
        let questionIdArr = new Array<any>(numQuestion);
        let questionTypeIdArr = new Array<any>(numQuestion);
        let questionRequiredArr = new Array<any>(numQuestion);
        let questionAnalyzeEntityArr = new Array<any>(numQuestion);
        let questionAnalyzeSentimentArr = new Array<any>(numQuestion);
        let questionShowCommentFieldWhenAnswersArr = new Array<any>(numQuestion);
        let showCommentFieldStatusArr = new Array<any>(numQuestion);
        let showConsentSectionArr = new Array<any>(numQuestion);
        let answerArr = new Array<any>(numQuestion);
        let answerInfoArr = new Array<any>(this.state.clientInfoNum);
        let commentArr = new Array<any>(numQuestion);
        let signatureArr = new Array<any>(numQuestion);
        let consentArr = new Array<any>(numQuestion);
        let skipLogicStatusArr = new Array<any>(numQuestion);
        let skipLogicArr = new Array<any>(numQuestion);
        let requiredLabelStatusArr = new Array<any>(numQuestion);
        let requiredLabelStatusInfoArr = new Array<any>(this.state.clientInfoNum);
        let requiredValidLabelStatusInfoArr = new Array<any>(this.state.clientInfoNum);
        let callAnswerApiArr = new Array<any>(numQuestion);
        let htmlElRefArr = new Array<any>(numQuestion);
        let htmlElRefInfoArr = new Array<any>(this.state.clientInfoNum);
        
        for(let i = 0; i < numQuestion; i++) { 
            nodeArr[i] = ''; 
            disableArr[i] = false; 
            questionIdArr[i] = '';
            questionTypeIdArr[i] = '';
            questionRequiredArr[i] = false;
            questionAnalyzeEntityArr[i] = '';
            questionAnalyzeSentimentArr[i] = '';
            questionShowCommentFieldWhenAnswersArr[i] = '';
            showCommentFieldStatusArr[i] = false;
            showConsentSectionArr[i] = false;
            answerArr[i] = '';
            commentArr[i] = '';
            signatureArr[i] = '';
            consentArr[i] = '';
            skipLogicStatusArr[i] = false;
            skipLogicArr[i] = '';
            requiredLabelStatusArr[i] = false;
            callAnswerApiArr[i] = false;
            htmlElRefArr[i] = '';
            htmlElRefInfoArr[i] = '';
        }

        for(let i = 0; i < this.state.clientInfoNum; i++) { 
            answerInfoArr[i] = '';
            requiredLabelStatusInfoArr[i] = false;
            requiredValidLabelStatusInfoArr[i] = false;
        }

        this.setState({ 
            survey: rp.Data.recordset[0], 
            nodeElement: nodeArr,
            disableElement: disableArr,
            numQuestion: numQuestion, 
            numPage: numPage, 
            questionId: questionIdArr, 
            questionTypeId: questionTypeIdArr, 
            questionRequired: questionRequiredArr, 
            questionAnalyzeEntity: questionAnalyzeEntityArr, 
            questionAnalyzeSentiment: questionAnalyzeSentimentArr, 
            questionShowCommentFieldWhenAnswers: questionShowCommentFieldWhenAnswersArr, 
            showCommentFieldStatus: showCommentFieldStatusArr, 
            showConsentSection: showConsentSectionArr, 
            answer: answerArr, 
            answerInfo: answerInfoArr, 
            comment: commentArr, 
            signature: signatureArr, 
            consent: consentArr,
            skipLogicStatus: skipLogicStatusArr, 
            skipLogic: skipLogicArr, 
            requiredLabelStatus: requiredLabelStatusArr, 
            requiredLabelStatusInfo: requiredLabelStatusInfoArr, 
            requiredValidLabelStatusInfo: requiredValidLabelStatusInfoArr, 
            callAnswerApi: callAnswerApiArr, 
            htmlElRef: htmlElRefArr, 
            htmlElRefInfo: htmlElRefInfoArr, 

        },  () => { 

                let surveyName: any, headerDescription: any, footerDescription: any, endOfSurveyMessage: any;

                if(this.state.lang){
                    //Get survey name
                    surveyName = this.state.survey.name_EN_html ? this.state.survey.name_EN_html : ( this.state.survey.name_EN ? this.state.survey.name_EN : this.state.survey.name );

                    headerDescription = this.state.survey.header_description_EN ? this.state.survey.header_description_EN.includes('~') ? this.state.survey.header_description_EN.split('~') : [this.state.survey.header_description_EN] : [''];
                    footerDescription = this.state.survey.footer_description_EN ? this.state.survey.footer_description_EN.includes('~') ? this.state.survey.footer_description_EN.split('~') : [this.state.survey.footer_description_EN] : [''];
                    endOfSurveyMessage = this.state.survey.end_of_survey_message_EN ? this.state.survey.end_of_survey_message_EN : '';
                }
                else{
                    //Get survey name
                    surveyName = ( this.state.survey.name_html ? this.state.survey.name_html : this.state.survey.name );

                    headerDescription = this.state.survey.header_description ? this.state.survey.header_description.includes('~') ? this.state.survey.header_description.split('~') : [this.state.survey.header_description] : [''];
                    footerDescription = this.state.survey.footer_description ? this.state.survey.footer_description.includes('~') ? this.state.survey.footer_description.split('~') : [this.state.survey.footer_description] : [''];
                    endOfSurveyMessage = this.state.survey.end_of_survey_message ? this.state.survey.end_of_survey_message : '';
                }

                // Replacing the ${...} string withe the survey data
                surveyName = surveyName.replace(/\${ProjectName}/g, this.state.survey.collector_project);
                surveyName = surveyName.replace(/\${CollectorName}/g, this.state.survey.collector_name);

                endOfSurveyMessage = endOfSurveyMessage.replace(/\${ProjectName}/g, this.state.survey.collector_project);
                endOfSurveyMessage = endOfSurveyMessage.replace(/\${CollectorName}/g, this.state.survey.collector_name);

                headerDescription.map((headerDescriptionTemp: any, i: number) => {
                    let headerDescriptionReplace = headerDescriptionTemp.replace(/\${ProjectName}/g, this.state.survey.collector_project);
                    headerDescription[i] = headerDescriptionReplace.replace(/\${CollectorName}/g, this.state.survey.collector_name);
                });

                footerDescription.map((footerDescriptionTemp: any, i: number) => {
                    let footerDescriptionReplace = footerDescriptionTemp.replace(/\${ProjectName}/g, this.state.survey.collector_project);
                    footerDescription[i] = footerDescriptionReplace.replace(/\${CollectorName}/g, this.state.survey.collector_name);
                });

                // Check if the client come to this survey from email or sms link
                if(clientData.email_id){
                    const apiUrl = '/email/';
                    const clientId = clientData.email_id;
                    BaseService.get<Email>(this.props.match.params.xSite, apiUrl, clientId).then(
                        (rp) => {
                            try{
                                if (rp.Status) {

                                    surveyName = surveyName.replace(/\${FirstName}/g, rp.Data.result.recordset[0].first_name);
                                    surveyName = surveyName.replace(/\${LastName}/g, rp.Data.result.recordset[0].last_name);

                                    endOfSurveyMessage = endOfSurveyMessage.replace(/\${FirstName}/g, rp.Data.result.recordset[0].first_name);
                                    endOfSurveyMessage = endOfSurveyMessage.replace(/\${LastName}/g, rp.Data.result.recordset[0].last_name);

                                    headerDescription.map((headerDescriptionTemp: any, i: number) => {
                                        let headerDescriptionReplace = headerDescriptionTemp.replace(/\${FirstName}/g, rp.Data.result.recordset[0].first_name);
                                        headerDescription[i] = headerDescriptionReplace.replace(/\${LastName}/g, rp.Data.result.recordset[0].last_name);
                                    });

                                    footerDescription.map((footerDescriptionTemp: any, i: number) => {
                                        let footerDescriptionReplace = footerDescriptionTemp.replace(/\${FirstName}/g, rp.Data.result.recordset[0].first_name);
                                        footerDescription[i] = footerDescriptionReplace.replace(/\${LastName}/g, rp.Data.result.recordset[0].last_name);
                                    });

                                    // Initial the client answer automaticly with the client data
                                    let answerInfoArr = new Array<any>(this.state.clientInfoNum);
                                    answerInfoArr[0] = clientData.name_title ? clientData.name_title : '';
                                    answerInfoArr[1] = clientData.first_name ? clientData.first_name : '';
                                    answerInfoArr[2] = clientData.last_name ? clientData.last_name : '';
                                    answerInfoArr[5] = clientData.email_address ? clientData.email_address : '';
                                    
                                    answerInfoArr[10] = clientData.project_name ? clientData.project_name : '';
                                    answerInfoArr[11] = clientData.company_name ? clientData.company_name : '';
                                    answerInfoArr[12] = clientData.department ? clientData.department : '';
                                    answerInfoArr[13] = clientData.position ? clientData.position : '';
                                    answerInfoArr[14] = clientData.consent_date ? clientData.consent_date : '';

                                    this.setState({ 
                                        surveyName: surveyName,
                                        headerDescription : headerDescription, 
                                        footerDescription: footerDescription,
                                        endOfSurveyMessage : endOfSurveyMessage,
                                        completionRedirect: this.state.survey.completion_redirect ? this.state.survey.completion_redirect : '',
                                        answerInfo: answerInfoArr,
                                        customerId: rp.Data.result.recordset[0].customer_id,
                                    }, () => {
                                        // Check if the client is already responded so to showing the thank you text and redirect to the url if set
                                        if(rp.Data.result.recordset[0].response_status === 3){
                                            this.setState({
                                                authorized: true, 
                                                thankyou: true, 
                                                isLoading: false,
                                            }, () => { 
                                                setTimeout(function(this: any){ 
                                                    let completionRedirect = this.state.completionRedirect;
                                                    if(completionRedirect){
                                                        if(completionRedirect.includes('http://')) completionRedirect = completionRedirect.replace('http://', '')
                                                        else if(completionRedirect.includes('https://')) completionRedirect = completionRedirect.replace('https://', '')
                                                        
                                                        completionRedirect = `http://${completionRedirect}`;
                                                        window.location.href = completionRedirect;
                                                    }
                                                }.bind(this), 5000);
                                            });
                                        }
                                        // Check if the client is already visit this survey so to showing the question on this survey
                                        else if(rp.Data.result.recordset[0].response_status === 2){
                                            this.setState({ 
                                                authorized: true,
                                                surveyId: clientData.survey_id, 
                                                collectorId: clientData.collector_id,
                                                responseId: rp.Data.result.recordset[0].response_id,
                                                email_id: clientData.email_id
                                            }, () => {
                                                this.renderElement(false);
                                                setInterval(this.updateTimeSpent.bind(this), 1000);
                                            });
                                        }
                                        // Check if the client is the first time to visit this survey then showing the question on this survey
                                        else{
            
                                            this.setState({ 
                                                email_id: clientData.email_id
                                            });

                                            const surveyResponseObj = {
                                                survey_id:  clientData.survey_id, 
                                                project_id:  this.state.survey.project_id,
                                                collector_id: clientData.collector_id, 
                                                time_spent: 0, 
                                                complete_status: 2,
                                                ip_address: '',
                                                email_id: clientData.email_id,
                                                email_address: clientData.email_address,
                                                first_name: clientData.first_name,
                                                last_name: clientData.last_name,
                                                custom_group: clientData.custom_group,
                                                customer_id: clientData.customer_id
                                            }

                                            this.createSurveyResponse(surveyResponseObj);
                                        }
                                    });
                                    
                                } else {
                                    toastr.error('Something went wrong!, please refresh the page or try again later.');
                                    console.log("get Email clientId Messages: " + rp.Messages);
                                    console.log("get Email clientId Exception: " + rp.Exception);
                                }
                            } catch(error){
                                toastr.error('Something went wrong!, please refresh the page or try again later.');
                                console.log("get Email clientId catch: " + error);
                            }
                        }
                    );
                }
                // Check if the client come to this survey from the QR code or pulbic link
                else{
                    // Trying to get an item from web browser localStorage.
                    const iconcxmClientToken = localStorage.getItem(`iconcxmclient${this.props.match.params.xSite}${clientData.collector_id}`) as any;
                    
                    // Get the client info from JWT item on the web browser
                    const clientDataToken = jwt.decode(iconcxmClientToken) as any;

                    // Check if the client never visit to this survey or this weblink QR can't redo
                    if(!iconcxmClientToken || weblinkRedo === 0 || (weblinkRedo === 2 && clientDataToken.completed && moment(clientDataToken.complete_date).add(weblinkNotRedoInDay, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss') < moment().format('YYYY-MM-DD HH:mm:ss'))){

                        // Auto filling the client info from client JWT info
                        let answerInfoArr = new Array<any>(this.state.clientInfoNum);
                        answerInfoArr[0] = clientData.name_title ? clientData.name_title : '';
                        answerInfoArr[1] = clientData.first_name ? clientData.first_name : '';
                        answerInfoArr[2] = clientData.last_name ? clientData.last_name : '';
                        answerInfoArr[3] = clientData.birthdate ? clientData.birthdate : '';
                        answerInfoArr[4] = clientData.mobile_number ? clientData.mobile_number : '';
                        answerInfoArr[5] = clientData.email_address ? clientData.email_address : '';
                        answerInfoArr[6] = clientData.line_id ? clientData.line_id : '';
                        answerInfoArr[7] = clientData.card_id ? clientData.card_id.slice(clientData.card_id.length - 4) : '';
                        answerInfoArr[8] = clientData.room_number ? clientData.room_number : '';
                        answerInfoArr[9] = clientData.institution_name ? clientData.institution_name : '';
                        answerInfoArr[10] = clientData.project_name ? clientData.project_name : '';
                        answerInfoArr[11] = clientData.company_name ? clientData.company_name : '';
                        answerInfoArr[12] = clientData.department ? clientData.department : '';
                        answerInfoArr[13] = clientData.position ? clientData.position : '';
                        answerInfoArr[14] = clientData.consent_date ? clientData.consent_date : '';

                        this.setState({ 
                            answerInfo: answerInfoArr,
                            surveyName: surveyName,
                            headerDescription: headerDescription,
                            footerDescription: footerDescription,
                            endOfSurveyMessage: endOfSurveyMessage,
                            completionRedirect: this.state.survey.completion_redirect ? this.state.survey.completion_redirect : ''
                        }, () => {
                            
                            // Create a survey response for this client
                            const surveyResponseObj = {
                                survey_id:  clientData.survey_id, 
                                project_id:  this.state.survey.project_id,
                                collector_id: clientData.collector_id, 
                                time_spent: 0, 
                                complete_status: 2,
                                ip_address: '',
                            }
                            this.createSurveyResponse(surveyResponseObj);
                        });
                    }
                    // Check if the client is already visited to this survey
                    else{
                        // Check if the client is already completed this survey
                        if(clientDataToken.completed){
                            this.setState({
                                authorized: true, 
                                thankyou: true, 
                                isLoading: false,
                                endOfSurveyMessage: endOfSurveyMessage,
                            }, () => { 
                                setTimeout(function(this: any){ 
                                    let completionRedirect = this.state.completionRedirect;
                                    if(completionRedirect){
                                        if(completionRedirect.includes('http://')) completionRedirect = completionRedirect.replace('http://', '')
                                        else if(completionRedirect.includes('https://')) completionRedirect = completionRedirect.replace('https://', '')
                                        
                                        completionRedirect = `http://${completionRedirect}`;
                                        window.location.href = completionRedirect;
                                    }
                                }.bind(this), 5000);
                            });
                        } 
                        // Check if the client is not yet complete this survey
                        else{
                            // Remove the iconcxmclient item from localStorage on web browser
                            localStorage.removeItem(`iconcxmclient${this.props.match.params.xSite}${clientData.collector_id}`);
                            setTimeout(function(){ window.location.reload(); }, 500);
                        }
                    }
                }
            }
        );
    }

    /** 
     * createSurveyResponse(surveyResponseObj: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Call api to create a response
     * 
     * Parameters   :  surveyResponseObj: Object
     * 
     */
    createSurveyResponse(surveyResponseObj: any){
        BaseService.create<SurveyResponse>(this.props.match.params.xSite, "/response", surveyResponseObj).then(
            (rp) => {
                try{
                    if (rp.Status) {

                        if(!rp.Data.result.recordsets.length) return;

                        const responseId = rp.Data.result.recordset[0].id;
                        
                        this.setState({ 
                            authorized: true,
                            surveyId: surveyResponseObj.survey_id, 
                            collectorId: surveyResponseObj.collector_id,
                            responseId: responseId, 
                        }, () => {
                            this.renderElement(false);
                            setInterval(this.updateTimeSpent.bind(this), 1000);
                        });

                    } else {
                        toastr.error('Something went wrong!, please refresh the page or try again later.');
                        BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey createSurveyResponse catch`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                    }

                } catch(error){
                    toastr.error('Something went wrong!, please refresh the page or try again later.');
                    BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey createSurveyResponse catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                }
            }
        );
    }

    /** 
     * updateTimeSpent()
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     update timespent 1 second
     */
    updateTimeSpent(){
        this.setState({
            timeSpent: this.state.timeSpent + 1,
        });
    }

    /** 
     * async renderElement(scrollTo: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Render all question elements without waiting this statment sequence (async)
     * 
     * Parameters   :  scrollTo: Boolean (need to scoll to any element position or not just incase of client didn't answer any required question)
     * 
     */
    async renderElement(scrollTo: any){
        try{
            const allElement = this.state.answer.map((obj: any, i: number) => this.getQuestionRow(this.state.surveyId, i+1, this.state.disableElement[i], this.state.skipLogicText[i], this.state.showCommentFieldStatus[i], this.state.showConsentSection[i], this.state.requiredLabelStatus[i], this.state.answer[i], this.state.comment[i], this.state.signature[i], this.state.consent[i]));
            const nodeElement = await Promise.all(allElement); // wait for all question elements is completed loading

            const allPageNo = this.state.answer.map((obj: any, i: number) => this.getPageNo(this.state.surveyId, i+1));
            const allPromisePageNo = await Promise.all(allPageNo); // wait for all page no. is completed loading

            // Check page no. in each item on the allPageNo list which is not the same as current page no. and adding the index to the remove list
            let indexListToRemove = [] as any;
            allPromisePageNo.forEach((questionPageNo: any, index: any) => {
                if(questionPageNo && parseInt(questionPageNo) !== this.state.currentPageNo){
                    indexListToRemove.push(index);
                }
            });
            // Remove the question(s) index which is not on the current page no.
            indexListToRemove.forEach((removeIndex: any, index: any) => { 
                delete nodeElement[removeIndex];
            });
            
            // Initial Client Info questions
            let infoQuestions = [];
            let allInfoElement: any
            let nodeInfoElement: any;

            if(this.state.survey.client_info_form){
                infoQuestions = [
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 0,
                        enable: this.state.survey.enable_name_title,
                        name: 'name-title',
                        typeId: 6,
                        label: this.state.lang ? 'Name Title' : 'คำนำหน้า',
                        required: this.state.survey.required_name_title,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        lang: this.state.lang
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 1,
                        enable: this.state.survey.enable_first_name,
                        name: 'first-name',
                        typeId: 5,
                        label: this.state.lang ? 'First Name' : 'ชื่อ',
                        required: this.state.survey.required_first_name,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 100,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 2,
                        enable: this.state.survey.enable_last_name,
                        name: 'last-name',
                        typeId: 5,
                        label: this.state.lang ? 'Last Name' : 'นามสกุล',
                        required: this.state.survey.required_last_name,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 100,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 3,
                        enable: this.state.survey.enable_birthdate,
                        name: 'birthday',
                        typeId: 5,
                        label: this.state.lang ? 'Birthday (DD/MM/YYYY)' : 'วันเดือนปีเกิด (วว/ดด/ปปปป)',
                        required: this.state.survey.required_birthdate,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 10,
                        cols: 10
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 4,
                        enable: this.state.survey.enable_mobile_number,
                        name: 'mobile-number',
                        typeId: 5,
                        label: this.state.lang ? 'Mobile Number' : 'เบอร์มือถือ',
                        required: this.state.survey.required_mobile_number,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 15,
                        cols: 20
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 5,
                        enable: this.state.survey.enable_email,
                        name: 'email',
                        typeId: 5,
                        label: this.state.lang ? 'Email' : 'อีเมล',
                        required: this.state.survey.required_email,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'Please enter a valid Email Address.' : 'กรุณาใส่อีเมลที่ถูกต้อง',
                        maxLength: 50,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 6,
                        enable: this.state.survey.enable_line_id,
                        name: 'line-id',
                        typeId: 5,
                        label: this.state.lang ? 'Line ID' : 'ไอดีไลน์',
                        required: this.state.survey.required_line_id,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 50,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 7,
                        enable: this.state.survey.enable_id_card_4_digit,
                        name: 'id-card-4-digit',
                        typeId: 5,
                        label: this.state.lang ? 'ID Card last 4 digits' : 'รหัสบัตรประชาชน 4 ตัวท้าย',
                        required: this.state.survey.required_id_card_4_digit,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 4,
                        cols: 6,
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 8,
                        enable: this.state.survey.enable_room_number,
                        name: 'room-number',
                        typeId: 5,
                        label: this.state.lang ? 'Room Number' : 'หมายเลขห้อง',
                        required: this.state.survey.required_room_number,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 10,
                        cols: 15,
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 9,
                        enable: this.state.survey.enable_institution_name,
                        name: 'institution-name',
                        typeId: 7,
                        label: this.state.lang ? 'Institution Name' : 'ชื่อสถาบัน',
                        required: this.state.survey.required_institution_name,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        requiredValidLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        lang: this.state.lang
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 10,
                        enable: this.state.survey.enable_project_name,
                        name: 'project-name',
                        typeId: 8,
                        label: this.state.lang ? 'Project Name' : 'ชื่อโครงการ',
                        required: this.state.survey.required_project_name,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        lang: this.state.lang
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 11,
                        enable: this.state.survey.enable_company_name,
                        name: 'company-name',
                        typeId: 5,
                        label: this.state.lang ? 'Company Name' : 'ชื่อบริษัท',
                        required: this.state.survey.required_company_name,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 100,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 12,
                        enable: this.state.survey.enable_department,
                        name: 'department',
                        typeId: 5,
                        label: this.state.lang ? 'Department' : 'แผนก',
                        required: this.state.survey.required_department,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 100,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 13,
                        enable: this.state.survey.enable_position,
                        name: 'position',
                        typeId: 5,
                        label: this.state.lang ? 'Position' : 'ตำแหน่ง',
                        required: this.state.survey.required_position,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        maxLength: 100,
                        cols: 50
                    },
                    {
                        globalFont: this.state.survey.global_font_family,
                        globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                        index: 14,
                        enable: this.state.survey.enable_consent_date,
                        name: 'consent-date',
                        typeId: 9,
                        label: this.state.lang ? 'Consent Date' : 'วันที่ยินยอม',
                        required: this.state.survey.required_consent_date,
                        requiredLabel: this.state.lang ? 'This question requires an answer.' : 'กรุณาให้คำตอบ',
                        lang: this.state.lang
                    },
                ];

                // allInfoElement = infoQuestions.map((infoQuestion: any, i: number) => this.getInfoQuestionRow(infoQuestion, this.state.requiredLabelStatusInfo[i], this.state.requiredValidLabelStatusInfo[i], this.state.answerInfo[i]));
                // nodeInfoElement = await Promise.all(allInfoElement);
            }
            
            // ReactDOM render and scroll to the position if required
            this.setState({ isLoading: false, isSuccessLoading: true }, () => {
                ReactDOM.render(<div>{nodeElement}</div>, document.getElementById('question-items-list'));
                if(this.state.survey.client_info_form) ReactDOM.render(<div>{nodeInfoElement}</div>, document.getElementById('question-info-list'));
                if(scrollTo !== false) this.container.scrollTop = scrollTo;
            });
        }catch(error){
            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey renderElement catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
        }
    }

    /** 
     * private onFieldValueChange(fieldName: string, value: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Update the state field which is match with the filed name with a new value
     * 
     * Parameters   :  fieldName: string,
     *                 value : string
     */
    private onFieldValueChange(fieldName: string, value: any) { 
        const nextState = {
            ...this.state,
            survey: {
                ...this.state.survey,
                [fieldName]: value,
            }
        };
        this.setState(nextState);
    }

    /** 
     * getPageNo = async (surveyId: any, i: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Get page no. from api for each question without waiting this statment sequence (async)
     * 
     * Parameters   :  surveyId: Integer,
     *                 i : Integer
     * 
     * Return Value : Integer
     */
    getPageNo = async (surveyId: any, i: any) => {
        return await BaseService.get<Question>(this.props.match.params.xSite, '/question/client/', surveyId + '/' + i).then(
            async (rp) => {
                try{
                    if (rp.Status) {

                        if(rp.Data.recordset.length){

                            const questionPageNo = rp.Data.recordset[0].page_no;

                            return questionPageNo;

                        } else {
                            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey getPageNo BaseService.get<Question> /question/${surveyId}/${i} else rp.Data.recordset.length`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                            return false;
                        }

                    }
                    else {
                        BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey getPageNo BaseService.get<Question> /question/${surveyId}/${i} else rp.Status`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                        return false;
                    }
                }catch(error){
                    BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey getPageNo BaseService.get<Question> /question/${surveyId}/${i} catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                }
            }
        );
    }

    /** 
     * getQuestionRow = async (surveyId: any, i: any, disable: any, skipLogicText: any, showCommentFieldStatus: any, showConsentSection: any, requiredLabelStatus: any, currentAnswer: any, currentComment: any, currentSignature: any, currentConsent: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Get question element info from api for each question without waiting this statment sequence (async)
     * 
     * Parameters   :   surveyId: Integer,
     *                  i : Integer,
     *                  disable : Boolean
     *                  skipLogicText : String
     *                  showCommentFieldStatus : Boolean
     *                  showConsentSection : Boolean
     *                  requiredLabelStatus : Boolean
     *                  currentAnswer : Integer or String
     *                  currentComment : String
     *                  currentSignature : String
     *                  currentConsent : String
     *
     * Return Value : Html Element
     */
    getQuestionRow = async (surveyId: any, i: any, disable: any, skipLogicText: any, showCommentFieldStatus: any, showConsentSection: any, requiredLabelStatus: any, currentAnswer: any, currentComment: any, currentSignature: any, currentConsent: any) => {

        const index = i-1;  

        return await BaseService.get<Question>(this.props.match.params.xSite, '/question/client/', surveyId + '/' + i).then(
            async (rp) => {
                try{
                    if (rp.Status) {

                        if(rp.Data.recordset.length === 1){
                            const question = rp.Data.recordset[0];

                            const questionNo = question.order_no;
                            const questionId = question.id[0];
                            const questionTypeId = question.type_id;
                            const questionSubTypeId = question.sub_type_id;

                            const questionLabel = this.state.lang ? question.question_label_EN : question.question_label;
                            const questionLabelHtml = this.state.lang ? ( question.question_label_EN_html ? question.question_label_EN_html : `<p>${questionLabel}</p>` ) : ( question.question_label_html ? question.question_label_html : `<p>${questionLabel}</p>`);

                            const questionRequired = question.required;
                            const questionRequiredLabel = this.state.lang ? (question.required_label_EN ? question.required_label_EN : question.required_label) : question.required_label;
                            const questionRequiredLabelHtml = this.state.lang ? ( question.required_label_EN_html ? question.required_label_EN_html : ( question.required_label_html ? question.required_label_html : `<p>${questionRequiredLabel}</p>` )) : ( question.required_label_html ? question.required_label_html : `<p>${questionRequiredLabel}</p>` );

                            const questionAnalyzeEntity = question.analyze_entity;
                            const questionAnalyzeSentiment = question.analyze_sentiment;

                            let questionSkipLogic = null;
                            if(question.skip_logic) questionSkipLogic =  question.skip_logic.includes(',') ? question.skip_logic.split(',') : null;

                            const questionShowCommentField = question.show_comment_field;
                            const questionCommentFieldLabel = this.state.lang ? (question.comment_field_label_EN ? question.comment_field_label_EN : question.comment_field_label) : question.comment_field_label;
                            const questionCommentFieldLabelHtml = this.state.lang ? (question.comment_field_label_EN_html ? question.comment_field_label_EN_html : (question.comment_field_label_html ? question.comment_field_label_html : `<p>${questionCommentFieldLabel}</p>`)) : (question.comment_field_label_html ? question.comment_field_label_html : `<p>${questionCommentFieldLabel}</p>`);
                            const questionCommentFieldHint = this.state.lang ? (question.comment_field_hint_EN ? question.comment_field_hint_EN : question.comment_field_hint) : question.comment_field_hint;
                            const questionCommentFieldHintHtml = this.state.lang ? (question.comment_field_hint_EN_html ? question.comment_field_hint_EN_html : (question.comment_field_hint_html ? question.comment_field_hint_html : `<p>${questionCommentFieldHint}</p>`)) : (question.comment_field_hint_html ? question.comment_field_hint_html : `<p>${questionCommentFieldHint}</p>`);

                            const questionShowCommentFieldWhenAnswers = question.show_comment_when_answer;

                            const questionShowConsentSection = question.enable_consent;

                            let questionIdArr = this.state.questionId;
                            questionIdArr[index] = questionId;

                            let questionTypeIdArr = this.state.questionTypeId;
                            questionTypeIdArr[index] = questionTypeId;

                            let questionRequiredArr = this.state.questionRequired;
                            questionRequiredArr[index] = questionRequired ? true : false;

                            let questionAnalyzeEntityArr = this.state.questionAnalyzeEntity;
                            questionAnalyzeEntityArr[index] = questionAnalyzeEntity;

                            let questionAnalyzeSentimentArr = this.state.questionAnalyzeSentiment;
                            questionAnalyzeSentimentArr[index] = questionAnalyzeSentiment;

                            let questionShowCommentFieldWhenAnswersArr = this.state.questionShowCommentFieldWhenAnswers;
                            questionShowCommentFieldWhenAnswersArr[index] = questionShowCommentFieldWhenAnswers;
                            
                            this.setState({
                                questionId: questionIdArr,
                                questionTypeId: questionTypeIdArr,
                                questionRequired: questionRequiredArr,
                                questionAnalyzeEntity: questionAnalyzeEntityArr,
                                questionAnalyzeSentiment: questionAnalyzeSentimentArr,
                                questionShowCommentFieldWhenAnswers: questionShowCommentFieldWhenAnswersArr,
                            });

                            let choices = [] as any;
                            let choicesHtml = [] as any;
                            let weights = [] as any;

                            let weightAnswer = [] as any;
                            let toPage = [] as any;
                            let toQuestion = [] as any;

                            let weightAnswerFrom = [] as any;
                            let weightAnswerTo = [] as any;

                            const questionImageEnabled = question.image_enabled ? question.image_enabled : '';
                            const questionImageType = question.image_src_type ? question.image_src_type.split(',') : '';
                            const questionImageName = question.image_name ? question.image_name.split(',') : '';
                            const questionImageNameHtml = question.image_name_html ? question.image_name_html.split('~') : (question.image_name ? question.image_name.split(',').map((name: any) => { return `<p>${name}</p>`; } ) : '<p></p>');
                            const questionImageSrc = question.image_src ? question.image_src.split(',') : '';
                            const questionImageDesc = question.image_description ? question.image_description.split(',') : '';
                            
                            //questionTypeId
                            // 1 = Rating, 2 = Multiple Choice, 3 = Checkbox, 4 = NPS, 5 = Text, 6 = Dropdown
                            if(questionTypeId === 1 || questionTypeId === 2 || questionTypeId === 3 || questionTypeId === 6 ){
                                
                                const questionChoice = this.state.lang ? question.choice_EN.split(',') : question.choice.split(',');
                                const questionChoiceHtml = this.state.lang ? ( question.choice_EN_html ? question.choice_EN_html.split('~') : ( question.choice_EN ? question.choice_EN.split(',').map((choice_EN: any) => { return `<p>${choice_EN}</p>`; }) : ( question.choice_html ? question.choice_html.split('~') : question.choice.split(',').map((choice: any) => { return `<p>${choice}</p>`; }) ) ) ) : ( question.choice_html ? question.choice_html.split('~') : question.choice.split(',').map((choice: any) => { return `<p>${choice}</p>`; }) );

                                choices = [] as any;
                                choicesHtml = [] as any;
                                weights = [] as any;
                                for(let i = 0; i < questionChoice.length; i++) {
                                    if (i % 2 === 0) {
                                        choices.push(questionChoice[i]);
                                        choicesHtml.push(questionChoiceHtml[i]);
                                    } 
                                    else {
                                        weights.push(questionChoice[i]);
                                    }
                                }
                                // Ex. Rating skip logic format 1,0,0,2,1,9,3,0,0,4,0,0,5,2,1
                                // 1,0,0 = there is no skip logic when answers the rating 1 on this rating question
                                // 2,1,9 = skip to question 9 on page 1 when answers the rating 2 on this rating question
                                // 5,2,1 = skip to question 1 on page 2 when answers the rating 5 on this rating question
                                weightAnswer = [] as any;
                                toPage = [] as any;
                                toQuestion = [] as any;
                                for(let i = 0; i < questionSkipLogic.length; i++) {
                                    if (i % 3 === 0) {
                                        weightAnswer.push(parseInt(questionSkipLogic[i]));
                                    } 
                                    else if (i % 3 === 1) {
                                        toPage.push(parseInt(questionSkipLogic[i]));
                                    }
                                    else {
                                        toQuestion.push(parseInt(questionSkipLogic[i]));
                                    }
                                }

                                // Ex. Rating skip logic format 1,0,0,2,0,0,3,0,0,4,0,0,5,0,0
                                // 1,0,0
                                // 2,0,0
                                // 3,0,0
                                // 4,0,0
                                // 5,0,0

                                // weightAnswer = [1,2,3,4,5]
                                // toPage = [0,0,0,0,0]
                                // toQuestion = [0,0,0,0,0]

                                // is every items in toPage and toQuestion array all 0
                                const disableSkipLogicPage = toPage.every((item: any) => toPage.indexOf(item) === 0 && item === 0);
                                const disableSkipLogicQuestion = toQuestion.every((item: any) => toQuestion.indexOf(item) === 0 && item === 0);

                                let skipLogicStatusArr = this.state.skipLogicStatus;
                                let skipLogicArr = this.state.skipLogic;

                                // There is some skip logic page and skip logic question
                                // Or
                                // There is some skip logic page and skip to end of survey to submit (there is -1 value in the toPage array)
                                if( (!disableSkipLogicPage && !disableSkipLogicQuestion) ||
                                    (!disableSkipLogicPage && toPage.indexOf(-1) > -1) ){
                                    skipLogicStatusArr[index] = true;
                                    skipLogicArr[index] = questionSkipLogic;
                                }

                                this.setState({
                                    skipLogicStatus: skipLogicStatusArr,
                                    skipLogic: skipLogicArr
                                });
                            }
                            else if(questionTypeId === 4){

                                // Ex. NPS skip logic = 0,5,0,0,6,8,0,0,9,10,0,0
                                // 0,5,0,0 = there is no skip logic when answers between 0 - 5 on this NPS question
                                // 6,8,1,9 = skip to question 9 on page 1 when answers between 6 - 8 on this NPS question
                                // 9,10,2,1 = skip to question 1 on page 2 when answers between 9 - 10 on this NPS question

                                weightAnswerFrom = [] as any;
                                weightAnswerTo = [] as any;
                                toPage = [] as any;
                                toQuestion = [] as any;
                                for(let i = 0; i < questionSkipLogic.length; i++) {
                                    if (i % 4 === 0) {
                                        weightAnswerFrom.push(parseInt(questionSkipLogic[i]));
                                    } 
                                    else if (i % 4 === 1) {
                                        weightAnswerTo.push(parseInt(questionSkipLogic[i]));
                                    }
                                    else if (i % 4 === 2) {
                                        toPage.push(parseInt(questionSkipLogic[i]));
                                    }
                                    else {
                                        toQuestion.push(parseInt(questionSkipLogic[i]));
                                    }
                                }

                                // Ex. NPS skip logic = 0,5,0,0,6,8,0,0,9,10,0,0
                                // 0,5,0,0
                                // 6,8,0,0
                                // 9,10,0,0

                                // weightAnswerFrom = [0,6,7]
                                // weightAnswerTo = [5,8,10]
                                // toPage = [0,0,0,0,0]
                                // toQuestion = [0,0,0,0,0]

                                // is every items in toPage and toQuestion array all 0
                                const disableSkipLogicPage = toPage.every((item: any) => toPage.indexOf(item) === 0 && item === 0);
                                const disableSkipLogicQuestion = toQuestion.every((item: any) => toQuestion.indexOf(item) === 0 && item === 0);

                                let skipLogicStatusArr = this.state.skipLogicStatus;
                                let skipLogicArr = this.state.skipLogic;
                                
                                // There is some skip logic page and skip logic question
                                // Or
                                // There is some skip logic page and (there is -1 value in the toPage array)
                                if( (!disableSkipLogicPage && !disableSkipLogicQuestion) ||
                                    (!disableSkipLogicPage && toPage.indexOf(-1) > -1) ){
                                    skipLogicStatusArr[index] = true;
                                    skipLogicArr[index] = questionSkipLogic;
                                }

                                this.setState({
                                    skipLogicStatus: skipLogicStatusArr,
                                    skipLogic: skipLogicArr
                                });
                            }
                                        
                            let element: any;
                            if(questionTypeId === 1){

                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    subTypeId: questionSubTypeId,
                                    choices: choices,
                                    choicesHtml: choicesHtml,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                    showCommentField: questionShowCommentField,
                                    commentFieldLabel: questionCommentFieldLabel,
                                    commentFieldLabelHtml: questionCommentFieldLabelHtml,
                                    commentFieldHint: questionCommentFieldHint,
                                    commentFieldHintHtml: questionCommentFieldHintHtml,
                                    emojiShape: question.shape,
                                    emojiColor: question.color,
                                    showLabel: question.show_label,
                                    // isMobile: this.state.isMobile
                                }

                                return <RatingQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-rating-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} commentHandler={this.commentHandler} disable={disable} skipLogicText={skipLogicText} showCommentFieldStatus={showCommentFieldStatus} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer} comment={currentComment}/>
                            }
                            else if(questionTypeId === 2){
                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    choices: choices,
                                    choicesHtml: choicesHtml,
                                    weights: weights,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                    showCommentField: questionShowCommentField,
                                    commentFieldLabel: questionCommentFieldLabel,
                                    commentFieldLabelHtml: questionCommentFieldLabelHtml,
                                    commentFieldHint: questionCommentFieldHint,
                                    commentFieldHintHtml: questionCommentFieldHintHtml,
                                }
                                return <ChoiceQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-choice-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} commentHandler={this.commentHandler} disable={disable} skipLogicText={skipLogicText} showCommentFieldStatus={showCommentFieldStatus} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer} comment={currentComment}/>
                            }
                            else if(questionTypeId === 3){
                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    choices: choices,
                                    choicesHtml: choicesHtml,
                                    weights: weights,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                    showCommentField: questionShowCommentField,
                                    commentFieldLabel: questionCommentFieldLabel,
                                    commentFieldLabelHtml: questionCommentFieldLabelHtml,
                                    commentFieldHint: questionCommentFieldHint,
                                    commentFieldHintHtml: questionCommentFieldHintHtml,
                                    limitSelection: question.limit_selection,
                                    limitMin: question.limit_min,
                                    limitMax: question.limit_max,
                                    showConsentSection: questionShowConsentSection,
                                }
                                return <CheckboxQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-checkbox-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} commentHandler={this.commentHandler} signatureHandler={this.signatureHandler} consentHandler={this.consentHandler} disable={disable} skipLogicText={skipLogicText} showCommentFieldStatus={showCommentFieldStatus} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer} comment={currentComment} signature={currentSignature} consent={currentConsent}/>
                            }
                            else if(questionTypeId === 4){
                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    subTypeId: questionSubTypeId,
                                    choices: choices,
                                    choicesHtml: choicesHtml,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    lowScoreLabel: this.state.lang ? question.low_score_label_EN : question.low_score_label,
                                    highScoreLabel: this.state.lang ? question.high_score_label_EN : question.high_score_label,
                                    lowScoreLabelHtml: this.state.lang ? ( question.low_score_label_EN_html ? question.low_score_label_EN_html : (question.low_score_label_EN ? `<p>${question.low_score_label_EN}</p>` : '<p></p>') ) : ( question.low_score_label_html ? question.low_score_label_html : (question.low_score_label ? `<p>${question.low_score_label}</p>` : '<p></p>') ),
                                    highScoreLabelHtml: this.state.lang ? ( question.high_score_label_EN_html ? question.high_score_label_EN_html : (question.high_score_label_EN ? `<p>${question.high_score_label_EN}</p>` : '<p></p>') ) : ( question.high_score_label_html ? question.high_score_label_html : (question.high_score_label ? `<p>${question.high_score_label}</p>` : '<p></p>') ),
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                    showCommentField: questionShowCommentField,
                                    commentFieldLabel: questionCommentFieldLabel,
                                    commentFieldLabelHtml: questionCommentFieldLabelHtml,
                                    commentFieldHint: questionCommentFieldHint,
                                    commentFieldHintHtml: questionCommentFieldHintHtml,
                                    showLabel: question.show_label,
                                }
                                return <ScoreQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-score-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} commentHandler={this.commentHandler} disable={disable} skipLogicText={skipLogicText} showCommentFieldStatus={showCommentFieldStatus} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer} comment={currentComment}/>
                            }
                            else if(questionTypeId === 5){
                                const questionHint = this.state.lang ? question.hint_EN : question.hint;
                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    hint: questionHint,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                }
                                return <TextQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-text-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} disable={disable} skipLogicText={skipLogicText} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer}/>
                            }
                            else if(questionTypeId === 6){
                                const questionObj = {
                                    globalFont: this.state.survey.global_font_family,
                                    globalFontSize: this.state.survey.global_font_size ? this.state.survey.global_font_size : '20px',
                                    no: questionNo,
                                    label: questionLabel,
                                    labelHtml: questionLabelHtml,
                                    choices: choices,
                                    choicesHtml: choicesHtml,
                                    weights: weights,
                                    imageEnabled: questionImageEnabled,
                                    imageType: questionImageType,
                                    imageName: questionImageName,
                                    imageNameHtml: questionImageNameHtml,
                                    imageSrc: questionImageSrc,
                                    imageDesc: questionImageDesc,
                                    required: questionRequired,
                                    requiredLabel: questionRequiredLabel,
                                    requiredLabelHtml: questionRequiredLabelHtml,
                                    showCommentField: questionShowCommentField,
                                    commentFieldLabel: questionCommentFieldLabel,
                                    commentFieldLabelHtml: questionCommentFieldLabelHtml,
                                    commentFieldHint: questionCommentFieldHint,
                                    commentFieldHintHtml: questionCommentFieldHintHtml,
                                }
                                return <DropdownQuestion ref={(ref) => { let htmlElRefArr = this.state.htmlElRef; htmlElRefArr[index] = ref; this.setState({ htmlElRef: htmlElRefArr }); }} key={'question-choice-'+i} xSite={this.props.match.params.xSite} surveyId={surveyId} question={questionObj} answerHandler={this.answerHandler} commentHandler={this.commentHandler} disable={disable} skipLogicText={skipLogicText} showCommentFieldStatus={showCommentFieldStatus} requiredLabelStatus={requiredLabelStatus} answer={currentAnswer} comment={currentComment}/>
                            }

                            return element;
                        }
                        else{
                            return <div key={index}></div>;
                        }

                    } else {
                        BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey getQuestionRow BaseService.get<Question> /question/${surveyId}/${i} else`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                        return <div key={index}></div>;
                    }
                } catch(error){ 
                    BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey getQuestionRow BaseService.get<Question> /question/${surveyId}/${i} catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                }
            }
        );

    }

    /** 
     * commentHandler(questionNo: any, comment: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Store the comment (string) to state valiable at the question no.
     * 
     * Parameters   :   questionNo: Object,
     *                  comment : String,
     */
    commentHandler(questionNo: any, comment: any){
        const index = questionNo-1;

        let commentArr = this.state.comment;
        commentArr[index] = comment;

        this.setState({
            comment: commentArr
        });
    }

    /** 
     * signatureHandler(questionNo: any, signature: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Store the signature (string) to state valiable at the question no.
     * 
     * Parameters   :   questionNo: Object,
     *                  signature : String,
     */
    signatureHandler(questionNo: any, signature: any){
        
        const index = questionNo-1;

        let signatureArr = this.state.signature;
        signatureArr[index] = signature;

        this.setState({
            signature: signatureArr
        },  () => { 
                // signatureHandler signature
            } 
        );
    }

    /** 
     * consentHandler(questionNo: any, consent: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Store the consent (string) to state valiable at the question no.
     * 
     * Parameters   :   questionNo: Object,
     *                  consent : String,
     */
    consentHandler(questionNo: any, consent: any){
        
        const index = questionNo-1;

        let consentArr = this.state.consent;
        consentArr[index] = consent;

        this.setState({
            consent: consentArr
        },  () => { 
                //consentHandler consent
            } 
        );
    }

    /** 
     * answerInfoHandler(index: any, answer: any, requiredStatus: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Update the client info answer to state valiable at the question index
     * 
     * Parameters   :   index : Integer,
     *                  answer : Integer or String,
     *                  requiredStatus : Boolean
     */
    answerInfoHandler(index: any, answer: any, requiredStatus: any){
        let answerInfoArr = this.state.answerInfo;
        answerInfoArr[index] = answer;

        let requiredLabelStatusInfoArr = this.state.requiredLabelStatusInfo;
        requiredLabelStatusInfoArr[index] = requiredStatus;

        this.setState({
            answerInfo: answerInfoArr,
            requiredLabelStatusInfo: requiredLabelStatusInfoArr
        });
    }

    /** 
     * onMouseClickDropdownOptionHandler = (e : any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Update the dropdown option answer
     * 
     * Parameters   :   e : Object (Html Element)
     */
    onMouseClickDropdownOptionHandler = (e : any) => {
        try{
            const value = e.target.value;
            this.answerInfoHandler(0, value ? value : '', !value && this.state.survey.required_name_title);

        }catch(error){ 
            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `preview-client-survey.component onMouseClickDropdownOptionHandler catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
        }
    }

    /** 
     * answerHandler(questionNo: any, answer: any, requiredStatus: any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Update the client answer to state valiable at the question index
     * 
     * Parameters   :   questionNo : Integer,
     *                  answer : Integer or String,
     *                  requiredStatus : Boolean
     */
    answerHandler(questionNo: any, answer: any, requiredStatus: any){

        try{
            const index = questionNo-1;

            let answerArr = this.state.answer;
            answerArr[index] = answer;

            let tmpSum = 0;
            for (const element of answerArr) {
                if(element){
                    tmpSum++;
                    this.setState({ sumAnswer: this.state.sumAnswer+1 })
                }
            }
            this.setState({ sumAnswer: tmpSum })

            let requiredLabelStatusArr = this.state.requiredLabelStatus;
            requiredLabelStatusArr[index] = requiredStatus;

            // Only Singha for OneTrust Consent fix survey_id and questionNo
            let oneTrustConsentFormArr = [];
            
            //3
            const consentIdFromOneTrust3 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //4
            const consentIdFromOneTrust4 = [
                { "Id": "363d9641-a1f3-4393-8da1-14947ca5e7ca" },
                { "Id": "651d84da-073b-49c9-9722-00cb687d7b15" },
                { "Id": "53631611-e708-4e7a-9e84-7cfa0db6db45" }
            ];
            //5
            const consentIdFromOneTrust5 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            
            //13 Santiburi the Residence - SMS
            const consentIdFromOneTrust13 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //14 Santiburi the Residence - Email
            const consentIdFromOneTrust14 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];

            //15 The ESSE 36 - SMS
            const consentIdFromOneTrust15 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //16 The ESSE 36 - Email
            const consentIdFromOneTrust16 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];

            //17 The ESSE Asoke - SMS
            const consentIdFromOneTrust17 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //18 The ESSE Asoke - Email
            const consentIdFromOneTrust18 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];

            //19 The ESSE Singha Complex - SMS
            const consentIdFromOneTrust19 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //20 The ESSE Singha Complex - Email
            const consentIdFromOneTrust20 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];

            //8 The Extro - SMS
            const consentIdFromOneTrust8 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];
            //12 The Extro - Email
            const consentIdFromOneTrust12 = [
                { "Id": "c96371c9-9491-4a0b-81e4-f01dd4010297" },
                { "Id": "c298df46-e28b-4a14-b9f6-c87ac809927e" },
                { "Id": "d922d504-8c99-4174-a886-327ec253d7e6" }
            ];

            let consentIdFromOneTrust = [] as any;
            let isSinghaConsentForm = false;

            // iconframework is for testing
            // if(this.props.match.params.xSite === 'iconframework' && this.state.surveyId === 33){ consentIdFromOneTrust = consentIdFromOneTrust3; isSinghaConsentForm = true; }

            if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 3){ consentIdFromOneTrust = consentIdFromOneTrust3; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 4){ consentIdFromOneTrust = consentIdFromOneTrust4; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 5){ consentIdFromOneTrust = consentIdFromOneTrust5; isSinghaConsentForm = true; }

            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 13){ consentIdFromOneTrust = consentIdFromOneTrust13; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 14){ consentIdFromOneTrust = consentIdFromOneTrust14; isSinghaConsentForm = true; }

            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 15){ consentIdFromOneTrust = consentIdFromOneTrust15; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 16){ consentIdFromOneTrust = consentIdFromOneTrust16; isSinghaConsentForm = true; }

            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 17){ consentIdFromOneTrust = consentIdFromOneTrust17; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 18){ consentIdFromOneTrust = consentIdFromOneTrust18; isSinghaConsentForm = true; }

            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 19){ consentIdFromOneTrust = consentIdFromOneTrust19; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 20){ consentIdFromOneTrust = consentIdFromOneTrust20; isSinghaConsentForm = true; }

            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 8){ consentIdFromOneTrust = consentIdFromOneTrust8; isSinghaConsentForm = true; }
            else if(this.props.match.params.xSite === 'singha' && this.state.surveyId === 12){ consentIdFromOneTrust = consentIdFromOneTrust12; isSinghaConsentForm = true; }
            //add new 28,31
            if(this.state.surveyId === 3 && isSinghaConsentForm && questionNo === 6 ){

                oneTrustConsentFormArr = answer ? answer.split(',').map((value: any, i: number) => {  
                    return value ? consentIdFromOneTrust[i] : null; 
                }) : [];

                oneTrustConsentFormArr = oneTrustConsentFormArr.filter(function(e: any) { return e === 0 || e });
                this.setState({
                    oneTrustConsentForm: oneTrustConsentFormArr,
                },  () => { 
                        // after oneTrustConsentForm
                    } 
                );
            }
            //Singha OneTrust Consent form 3
            //if for local testing form 3
            else if(isSinghaConsentForm && questionNo === 1 ){

                oneTrustConsentFormArr = answer ? answer.split(',').map((value: any, i: number) => {  
                    return value ? consentIdFromOneTrust[i] : null; 
                }) : [];

                oneTrustConsentFormArr = oneTrustConsentFormArr.filter(function(e: any) { return e === 0 || e });
                this.setState({
                    oneTrustConsentForm: oneTrustConsentFormArr,
                },  () => { 
                        // after oneTrustConsentForm
                    } 
                );
            }

            if(!this.state.skipLogic[index] && !this.state.questionShowCommentFieldWhenAnswers[index]){
                this.setState({
                    answer: answerArr,
                    requiredLabelStatus: requiredLabelStatusArr
                });
                return;
            }

            let disableArr = this.state.disableElement;
            let skipLogicTextArr = this.state.skipLogicText;
            let showCommentFieldStatusArr = this.state.showCommentFieldStatus;

            // Any skip logic is set on this question
            if(this.state.skipLogic[index]){

                let weightAnswers = [] as any;
                let toPage = [] as any;
                let toQuestion = [] as any;
                
                let weightAnswersFrom = [] as any;
                let weightAnswersTo = [] as any;

                const questionSkipLogic = this.state.skipLogic[index];

                // Initial all the next question(s) skip status (boolean) to false
                for(let j = index+1; j < this.state.numQuestion; j++) {
                    disableArr[j] = false;
                }
                if(this.state.questionTypeId[index] === 1 || this.state.questionTypeId[index] === 2 || this.state.questionTypeId[index] === 6){
                            
                    weightAnswers = [] as any;
                    toPage = [] as any;
                    toQuestion = [] as any;
                    for(let i = 0; i < questionSkipLogic.length; i++) {
                        if (i % 3 === 0) {
                            weightAnswers.push(parseInt(questionSkipLogic[i]));
                        } 
                        else if (i % 3 === 1) {
                            toPage.push(parseInt(questionSkipLogic[i]));
                        }
                        else {
                            toQuestion.push(parseInt(questionSkipLogic[i]));
                        }
                    }

                    weightAnswers.forEach((weightAnswer: any, i: any) => {
                        // Client answers as the same answer as the skip logic data
                        if(parseInt(answer) === parseInt(weightAnswer)){
                            // There is a skip logic to end of the survey for this question
                            if(toPage[i] === -1){
                                // Initial all the next question(s) skip status (boolean) to true
                                for(let k = index+1; k < this.state.numQuestion; k++) {
                                    disableArr[k] = true;
                                    skipLogicTextArr[k] = `โปรดข้ามไปส่วนสุดท้ายของแบบสอบถาม (กดปุ่มส่งแบบสอบถามเพื่อยืนยันคำตอบ)`;
                                }
                            }
                            // There is a skip logic to some page and some question on the survey
                            else if(toPage[i] !== 0 && toQuestion[i] !== 0){

                                // Initial all the next question(s) skip status (boolean) to false
                                for(let j = index+1; j < this.state.numQuestion; j++) { 
                                    disableArr[j] = false; 
                                }

                                // Initial all the next question(s) skip status (boolean) to true (toQuestion[i]-1 = skip to the question no.) and set the skip text
                                for(let k = index+1; k < toQuestion[i]-1; k++) {
                                    disableArr[k] = true;
                                    skipLogicTextArr[k] = `โปรดข้ามไปยังข้อ ${toQuestion[i]}.`;
                                }
                                return;
                            }
                            // There is no skip logic on this question
                            else{
                                // Initial all the next question(s) skip status (boolean) to false
                                for(let j = index+1; j < this.state.numQuestion; j++) {
                                    disableArr[j] = false;
                                }
                                return;
                            }
                            
                        }
                    });
                    
                }
                else if(this.state.questionTypeId[index] === 3){
                            
                    weightAnswers = [] as any;
                    toPage = [] as any;
                    toQuestion = [] as any;
                    for(let i = 0; i < questionSkipLogic.length; i++) {
                        if (i % 3 === 0) {
                            weightAnswers.push(parseInt(questionSkipLogic[i]));
                        } 
                        else if (i % 3 === 1) {
                            toPage.push(parseInt(questionSkipLogic[i]));
                        }
                        else {
                            toQuestion.push(parseInt(questionSkipLogic[i]));
                        }
                    }

                    const answers = answer.includes(',') ? answer.split(',') : [answer];

                    // store the skip logic page no. and question no.
                    const skipPageNoArr = [] as any;
                    const skipQustionNoArr = [] as any;

                    weightAnswers.forEach((weightAnswer: any, i: any) => {

                        for(let ansIndex = 0; ansIndex < answers.length; ansIndex++) {
                            // Client answers as the same answer as the skip logic data
                            if(parseInt(answers[ansIndex]) === parseInt(weightAnswer)){
                                skipPageNoArr.push(toPage[i]);
                                skipQustionNoArr.push(toQuestion[i]);
                                return;
                            }
                        }

                    });

                    // find the closest question no.
                    const minQustionNo = Math.min(...skipQustionNoArr);
                    if(skipQustionNoArr.length){

                        
                        for(let j = index+1; j < this.state.numQuestion; j++) { 
                            disableArr[j] = false; 
                        }

                        // There is no skip logic to end of the survey for this question
                        if(skipPageNoArr.indexOf(-1) === -1){

                            // Initial all the next question(s) skip status (boolean) to true (minQustionNo-1 = skip to the closest question no.) and set the skip text
                            for(let k = index+1; k < minQustionNo-1; k++) {
                                disableArr[k] = true;
                                skipLogicTextArr[k] = `โปรดข้ามไปยังข้อ ${minQustionNo}.`;
                            }
                        }
                        // There is a skip logic to end of the survey for this question
                        else{

                            // Initial all the next question(s) skip status (boolean) to true until end of the survey for this question and set the skip text
                            for(let k = index+1; k < this.state.numQuestion; k++) {
                                disableArr[k] = true;
                                skipLogicTextArr[k] = `โปรดข้ามไปส่วนสุดท้ายของแบบสอบถาม (กดปุ่มส่งแบบสอบถามเพื่อยืนยันคำตอบ)`;
                            }
                        }
                    }
                    
                }
                else if(this.state.questionTypeId[index] === 4){

                    weightAnswersFrom = [] as any;
                    weightAnswersTo = [] as any;
                    toPage = [] as any;
                    toQuestion = [] as any;
                    for(let i = 0; i < questionSkipLogic.length; i++) {
                        if (i % 4 === 0) {
                            weightAnswersFrom.push(parseInt(questionSkipLogic[i]));
                        } 
                        else if (i % 4 === 1) {
                            weightAnswersTo.push(parseInt(questionSkipLogic[i]));
                        }
                        else if (i % 4 === 2) {
                            toPage.push(parseInt(questionSkipLogic[i]));
                        }
                        else {
                            toQuestion.push(parseInt(questionSkipLogic[i]));
                        }
                    }
                    
                    weightAnswersFrom.forEach((weightAnswerFrom: any, i: any) => {
                        
                        // Client answers between the skip logic data
                        if(answer >= weightAnswerFrom && answer <= weightAnswersTo[i]){
                            // There is a skip logic to end of the survey for this question
                            if(toPage[i] === -1){
                                for(let k = index+1; k < this.state.numQuestion; k++) {
                                    disableArr[k] = true;
                                    skipLogicTextArr[k] = `โปรดข้ามไปส่วนสุดท้ายของแบบสอบถาม (กดปุ่มส่งแบบสอบถามเพื่อยืนยันคำตอบ)`;
                                }
                            }
                            // There is a skip logic to some page and some question on the survey
                            else if(toPage[i] !== 0 && toQuestion[i] !== 0){

                                // Initial all the next question(s) skip status (boolean) to false
                                for(let j = index+1; j < this.state.numQuestion; j++) { 
                                    disableArr[j] = false; 
                                }

                                // Initial all the next question(s) skip status (boolean) to true (toQuestion[i]-1 = skip to the question no.) and set the skip text
                                for(let k = index+1; k < toQuestion[i]-1; k++) {
                                    disableArr[k] = true;
                                    skipLogicTextArr[k] = `โปรดข้ามไปยังข้อ ${toQuestion[i]}.`;
                                }
                                return;
                            }
                            // There is no skip logic on this question
                            else{
                                // Initial all the next question(s) skip status (boolean) to false
                                for(let j = index+1; j < this.state.numQuestion; j++) {
                                    disableArr[j] = false;
                                }
                                return;
                            }
                            
                        }
                    });

                }

            }

            //is set to show the comment filed when client answers on this question
            if(this.state.questionShowCommentFieldWhenAnswers[index]){

                const questionShowCommentFieldWhenAnswers = this.state.questionShowCommentFieldWhenAnswers[index].includes(',') ? this.state.questionShowCommentFieldWhenAnswers[index].split(',') : [ this.state.questionShowCommentFieldWhenAnswers[index] ];

                showCommentFieldStatusArr[index] = false;

                // Is the client answered to be the same choice as the setting on Rating or Multiple choice or Dropdown question
                if(this.state.questionTypeId[index] === 1 || this.state.questionTypeId[index] === 2 || this.state.questionTypeId[index] === 6){

                    questionShowCommentFieldWhenAnswers.forEach((whenAnswer: any, i: any) => {
                        if(parseInt(answer) === parseInt(whenAnswer)){
                            showCommentFieldStatusArr[index] = true;
                            return;
                        }
                    });

                }
                // Is the client answered to be the same choice as the setting on Checkbox question (allow more then one answer)
                else if(this.state.questionTypeId[index] === 3 && answer !== ''){
                            
                    const answers = answer.includes(',') ? answer.split(',') : [answer];

                    questionShowCommentFieldWhenAnswers.forEach((whenAnswer : any, i: any) => {
                        for(let ansIndex = 0; ansIndex < answers.length; ansIndex++) {
                            if(answers[ansIndex] === whenAnswer){
                                showCommentFieldStatusArr[index] = true;
                                return;
                            }
                        }
                    });
                    
                }
                // Is the client answered to be the same choice as the setting on NPS question
                else if(this.state.questionTypeId[index] === 4 && answer !== ''){

                    questionShowCommentFieldWhenAnswers.forEach((whenAnswer: any, i: any) => {
                        if(parseInt(answer) === parseInt(whenAnswer)){
                            showCommentFieldStatusArr[index] = true;
                            return;
                        }
                    });

                }
            }
            this.setState({
                answer: answerArr,
                disableElement: disableArr,
                skipLogicText: skipLogicTextArr,
                showCommentFieldStatus: showCommentFieldStatusArr,
            },  () => { 
                    this.renderElement(false);
                } 
            );

        }catch(error){
            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey answerHandler catch questionNo = ${questionNo}, answer = ${answer}, requiredStatus = ${requiredStatus}`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
        }
        
    }

    /** 
     * validMail(mail : any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Check the valid e-mail address format with RegExp.test
     * 
     * Parameters   : mail : String (E-mail address)
     * 
     * Return Value : Boolean (true = valid, false = invalid)
     */
    validMail(mail : any)
    {
        return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
    }
    
    async isRequiredAnswer(){
        try{
            let requiredAnswer = false;
            let scrollTo = [];
            let requiredLabelStatusArr = this.state.requiredLabelStatus;

            const allPageNo = this.state.answer.map((obj: any, i: number) => this.getPageNo(this.state.surveyId, i+1));
            const allPromisePageNo = await Promise.all(allPageNo);
            
            let indexListToCheck = [] as any;
            allPromisePageNo.forEach((questionPageNo: any, index: any) => {
                if(questionPageNo && parseInt(questionPageNo) === this.state.currentPageNo){
                    indexListToCheck.push(index);
                }
            });
            
            const fromQuestionIndex = Math.min(...indexListToCheck);
            const toQuestionIndex = Math.max(...indexListToCheck);
            
            for(let i = fromQuestionIndex; i <= toQuestionIndex; i++) {
                
                // requiredLabelStatusArr[i] = false;

                if( (this.state.questionRequired[i] || requiredLabelStatusArr[i]) && this.state.answer[i] === '' && !this.state.disableElement[i] && this.state.htmlElRef[i]){

                    const container = ReactDOM.findDOMNode(this.state.htmlElRef[i]) as HTMLDivElement;

                    requiredLabelStatusArr[i] = true;

                    scrollTo.push(container.offsetTop);
                    requiredAnswer = true;
                }

            }

            this.setState({
                requiredLabelStatus: requiredLabelStatusArr,
            });

            if(requiredAnswer){

                this.renderElement(false);

                // if(!isRequiredAnswerInfo) this.container.scrollTop = scrollTo[0];

                this.setState({ submitLoading: false });
                
                return true;
            }
            else{
                return false;
            }
        }catch(error){
            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey isRequiredAnswer catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
        }
    }

    /** 
     * onMouseClickNextHandler = (e : any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Check all the quesiton on current page is not required answer if so send the client to the next survey page
     * 
     * Parameters   :  e : Object (Html Element)
     */
    onMouseClickNextHandler = async (e : any) => {

        // let isRequiredAnswerInfo = false;
        // if(this.state.survey.client_info_form) isRequiredAnswerInfo = this.isRequiredAnswerInfo();

        const isRequiredAnswer = await this.isRequiredAnswer();
        if(!isRequiredAnswer){
            this.setState({
                currentPageNo: this.state.currentPageNo+1,
                isLoading: true
            },  () => { 
                    this.renderElement(0);
                } 
            );
        };
    }
    
    /** 
     * onMouseClickPrevHandler = (e : any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Send the client back to the previous survey page
     * 
     * Parameters   :  e : Object (Html Element)
     */
    onMouseClickPrevHandler = (e : any) => {
        this.setState({
            currentPageNo: this.state.currentPageNo-1,
            isLoading: true 
        },  () => { 
                this.renderElement(0);
            } 
        );
    }

    /** 
     * onMouseClickSubmitHandler = (e : any)
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Process to submit this survey with client answers when the client clicked the submit button
     * 
     * Parameters   :  e : Object (Html Element)
     */
    onMouseClickSubmitHandler = async (e : any) => {

        this.setState({ submitLoading: true });

        // let isRequiredAnswerInfo = false;
        // let isRequiredValidInfo = false;
        // if(this.state.survey.client_info_form){
        //     isRequiredAnswerInfo = this.isRequiredAnswerInfo();
        // } 

        const isRequiredAnswer = await this.isRequiredAnswer();

        if(!isRequiredAnswer){// && !isRequiredAnswerInfo && !isRequiredValidInfo){
            let answerObj = [] as any;
            const surveyResponseObj = {
                response_id: this.state.responseId,
                survey_id:  this.state.surveyId, 
                project_id:  this.state.survey.project_id,
                collector_id: this.state.collectorId, 
                email_id: this.state.email_id,
                time_spent: this.state.timeSpent,
                complete_status: 3,

                // name_title: this.state.answerInfo[0],
                // first_name: this.state.answerInfo[1],
                // last_name: this.state.answerInfo[2],
                // birthdate: this.state.answerInfo[3],
                // mobile_number: this.state.answerInfo[4],
                // email_address: this.state.answerInfo[5],
                // line_id: this.state.answerInfo[6],
                // id_card_4_digit: this.state.answerInfo[7],
                // room_number: this.state.answerInfo[8],
                // institution_name: this.state.answerInfo[9],
                // project_name: this.state.answerInfo[10],
                // company_name: this.state.answerInfo[11],
                // department: this.state.answerInfo[12],
                // position: this.state.answerInfo[13],
                // consent_date: this.state.answerInfo[14] ? moment(this.state.answerInfo[14]).format("DD/MM/YYYY") : '',
                customer_id: this.state.customerId,
            }

            // Update the client info with api
            BaseService.update(this.props.match.params.xSite, "/response", ``, surveyResponseObj).then(
                (rp) => {
                    try{
                        if (rp.Status) {
                            
                            // Update the client answer for each question with api
                            for(let i = 0; i < this.state.numQuestion; i++) {
                                const obj = {
                                    survey_id:  this.state.surveyId,
                                    project_id:  this.state.survey.project_id,
                                    collector_id: this.state.collectorId,
                                    response_id: this.state.responseId,
                    
                                    question_id: this.state.questionId[i],
                                    question_type_id: this.state.questionTypeId[i],

                                    question_analyze_entity: this.state.questionAnalyzeEntity[i],
                                    question_analyze_sentiment: this.state.questionAnalyzeSentiment[i],
                    
                                    answer: this.state.answer[i],
                                    comment: this.state.comment[i],
                                    signature_image: this.state.signature[i],
                                    consent_image_path: this.state.consent[i],
                                    analyze_entity: '',
                                    analyze_sentiment: '',
                    
                                    skip_status: this.state.answer[i] ? 0 : 1,
                                    alert_status: 0,
                                }
                                answerObj.push(obj);
                            }

                            for(let i = 0; i < this.state.numQuestion; i++) {


                                let callAnswerApiArr = this.state.callAnswerApi;
                                callAnswerApiArr[i] = true;

                                this.setState({
                                    callAnswerApi: callAnswerApiArr,
                                });

                                // Create the client answer for each question with api
                                BaseService.create<Answer>(this.props.match.params.xSite, "/answer" + ``, answerObj[i]).then(
                                    (rp) => {
                                        try{
                                            if (rp.Status) {
                                                const answerInsertedId = rp.Data.result.recordset[0].id;

                                                let callAnswerApiArr = this.state.callAnswerApi;
                                                callAnswerApiArr[i] = false;

                                                this.setState({
                                                    callAnswerApi: callAnswerApiArr,
                                                });

                                                let text: '';
                                                if(answerObj[i].question_type_id === 5){
                                                    text = answerObj[i].answer;
                                                }
                                                else{
                                                    text = answerObj[i].comment;
                                                }
                                            
                                                // Update the analysis answer for the entity or setiment question with api
                                                if( !answerObj[i].skip_status && text.trim() !== '' && (answerObj[i].question_analyze_entity === 1 || answerObj[i].question_analyze_sentiment === 1) ){
                                                    BaseService.update(this.props.match.params.xSite, '/answer/googleapi/', answerObj[i].question_type_id + '/' + answerInsertedId, answerObj[i]).then(
                                                        (rp: any) => {
                                                            if (rp.Status) {
                                                            } else {
                                                                BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey onMouseClickSubmitHandler BaseService.update /answer/googleapi/${answerObj[i].question_type_id}/${answerInsertedId} else`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                                                            }
                                                        }
                                                    );
                                                }

                                            } else {
                                                BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey onMouseClickSubmitHandler BaseService.create<Answer> /answer/answer[${i}] else`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });
                                            }
                                        }catch(error){ 
                                            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey onMouseClickSubmitHandler BaseService.create<Answer> /answer/answer[${i}] catch`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                                        }
                                    }
                                );

                            }

                            // Set a timer to check every second if all the answer is store into the database through api
                            setInterval(function (this: any) {
                                // Not yet complete and all the answer is store into the database through api 
                                if(!this.state.thankyou && this.state.callAnswerApi.indexOf(true) == -1){

                                    this.setState({
                                        submitLoading: false,
                                        thankyou: true,
                                    }, () => { 
                                        const clietData = {completed: true, complete_date: moment().format('YYYY-MM-DD HH:mm:ss')}
                                        const privateKey = 'iconcxm';
                                        const opts = {};
                                        const clientToken = jwt.sign(clietData, privateKey, opts);
                                        localStorage.setItem(`iconcxmclient${this.props.match.params.xSite}${this.state.collectorId}`, clientToken);
                                        setTimeout(function(this: any){ 
                                            let completionRedirect = this.state.completionRedirect;
                                            if(completionRedirect){
                                                if(completionRedirect.includes('http://')) completionRedirect = completionRedirect.replace('http://', '')
                                                else if(completionRedirect.includes('https://')) completionRedirect = completionRedirect.replace('https://', '')
                                                
                                                completionRedirect = `http://${completionRedirect}`;
                                                window.location.href = completionRedirect;
                                            }
                                        }.bind(this), 5000);
                                    });

                                }
                            }.bind(this), 1000);

                        } else {
                            if(rp.Messages === 'You have already responded.'){ 
                                toastr.success(rp.Messages); 
                                this.setState({
                                    submitLoading: false,
                                    thankyou: true,
                                }, () => { 
                                        setTimeout(function(this: any){ 
                                            let completionRedirect = this.state.completionRedirect;
                                            if(completionRedirect){
                                                if(completionRedirect.includes('http://')) completionRedirect = completionRedirect.replace('http://', '')
                                                else if(completionRedirect.includes('https://')) completionRedirect = completionRedirect.replace('https://', '')
                                                
                                                completionRedirect = `http://${completionRedirect}`;
                                                window.location.href = completionRedirect;
                                            }
                                        }.bind(this), 5000);
                                    } 
                                );
                            }
                            else{ 
                                this.setState({ submitLoading: false });
                                toastr.success('Almost Done! Just click on Submit button again.'); 
                            }

                            BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey onMouseClickSubmitHandler else response_id = ${this.state.responseId}, survey_id = ${this.state.surveyId}, project_id = ${this.state.survey.project_id}`, message: `Messages: ${rp.Messages} | Exception: ${rp.Exception}` }, this.props.match.params.xSite).then( (rp) => { console.log(`Messages: ${rp.Messages} | Exception: ${rp.Exception}`); });

                        }
                    }catch(error){ 
                        this.setState({ submitLoading: false });
                        toastr.error('Something went wrong!, please click on Submit button or refresh the page and complete the survey again.');
                        BaseService.post(this.props.match.params.xSite, "/frontendlogclient/", { method: `client-survey onMouseClickSubmitHandler BaseService.update /response/ catch response_id = ${this.state.responseId}, survey_id = ${this.state.surveyId}, project_id = ${this.state.survey.project_id}`, message: `catch: ${error}` }, this.props.match.params.xSite).then( (rp) => { console.log(`catch: ${error}`); });
                    }
                }
            );
        };
    }

    /** 
     * callback = ()
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Specifying your onload callback function (Recaptcha Loaded)
     */
    callback = () => { };
    
    /** 
     * render()
     * 
     * Author1:  Siam Nganphairojsakun (siam@iconframework.com)
     * 
     * Summary the function: 
     * 
     *     Render all html element for this page
     */
    render() {
        const fontStyles = reactCSS({
            'default': {
                globalFont: {
                    fontFamily: this.state.survey.global_font_family, fontSize: this.state.survey.global_font_size
                }
            }
        });

        const styles = reactCSS({
            'default': {
                previousButton: {
                    display: 'inline-block', fontFamily: this.state.survey.global_font_family, fontSize: this.state.survey.global_font_size, fontWeight: 900, marginRight: '10px',
                    backgroundColor: this.state.survey.button_color_theme
                },
                nextButton: {
                    display: 'inline-block', fontFamily: this.state.survey.global_font_family, fontSize: this.state.survey.global_font_size, fontWeight: 900,
                    backgroundColor: this.state.survey.button_color_theme
                },
                doneButton: {
                    display: 'inline-block', fontFamily: this.state.survey.global_font_family, fontSize: this.state.survey.global_font_size, fontWeight: 900,
                    backgroundColor: this.state.survey.button_color_theme
                },
                surveyImage: {
                    marginTop: '30px',
                    width: this.state.survey.image_width ? ( parseInt(this.state.survey.image_width) > 0 ? parseInt(this.state.survey.image_width) : 200 ) : 200,
                    minWidth: 50,
                    maxWidth: '100%',
                    zIndex: 1
                },
                endOfMessageImage: {
                    marginBottom: '35px',
                    width: this.state.survey.end_of_survey_image_width ? ( parseInt(this.state.survey.end_of_survey_image_width) > 0 ? parseInt(this.state.survey.end_of_survey_image_width) : 200 ) : 200,
                    minWidth: 50,
                    maxWidth: '100%',
                    zIndex: 1
                },
                surveyBackground: {
                    border: '0',
                    opacity: '1',
                    backgroundColor: `${this.state.survey.background_color}`,
                    backgroundImage: `url("${this.state.survey.background_image}")`,
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                }
            }
        });

        if (this.state.isLoading) {
            return <div id="overlay"><img className="img" style={{ width: '20px' }} src={`/cxm/client/loading.gif`} alt="Loading"/> Loading...</div>
        }
        else if (!this.state.authorized) {
            return  <div><p>status : 403<br></br>Sorry, you are not authorized to access this page.</p></div>
        }
        else if(this.state.thankyou){
            return  <div ref={ el => this.container = el} style={containerStyles}>
                        <main className="v3theme text_center">
                        { (this.state.survey.end_of_survey_enable_src_type === 2 && this.state.survey.end_of_survey_banner_src) ? // For the end of survey banner type
                            <div className="survey-thankyou-page">
                                <img style={{ width: '100%', marginBottom: '35px' }} src={this.state.survey.end_of_survey_banner_src} alt="logo"/>
                                <h1 className="survey-thankyou-title user-generated notranslate">
                                    <span className="title-text" style={fontStyles.globalFont}>
                                        {parse(this.state.endOfSurveyMessage)}
                                    </span>
                                </h1>

                                { this.state.completionRedirect ?
                                <div className="clearfix" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
                                    <div className="spin-completion-redirect" style={{ textAlign: 'center' }}>
                                        <img className="img" style={{ width: '20px' }} src={`/cxm/client/loading.gif`} alt="Loading"/> Redirecting... you to {this.state.completionRedirect}
                                    </div>
                                </div>
                                : null }

                            </div>
                            : // For the end of survey logo type
                            <article data-page-id="110955719" className="survey-page survey-page-white" style={styles.surveyBackground}>
                                <section className="survey-page-body" style={{ paddingTop: '0'}}>
                                    <div className="question-row clearfix" style={{ paddingTop: '100px' }}>
                                        <div className="question-container">
                                            <div id="question-field-439413964" className=" question-presentation-image qn question image" data-alt-title="Image" style={{ textAlign: 'center' }}>
                                                <img className={this.state.survey.end_of_survey_image_src ? "user-generated" : 'hidden'} style={styles.endOfMessageImage} src={this.state.survey.end_of_survey_image_src} alt="logo"/>
                                                <h1 className="survey-title user-generated notranslate">
                                                    <span className="title-text" style={fontStyles.globalFont}>
                                                        {parse(this.state.endOfSurveyMessage)}
                                                    </span>
                                                </h1>
                                            </div>
                                        </div>
                                    </div>

                                    { this.state.completionRedirect ?
                                    <div className="clearfix" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
                                        <div className="spin-completion-redirect" style={{ textAlign: 'center' }}>
                                            <img className="img" style={{ width: '20px' }} src={`/cxm/client/loading.gif`} alt="Loading"/> Redirecting... you to {this.state.completionRedirect}
                                        </div>
                                    </div>
                                    : null }
                                </section>
                            </article>
                            }
                        </main>
                    </div>    
        }
        // else if(this.state.cutoffDue){
        //     return  <div ref={ el => this.container = el} style={containerStyles}>
        //                 <main className="v3theme text_center">
        //                     { (this.state.survey.enable_src_type === 2 && this.state.survey.banner_src) ?
        //                     <div className="survey-thankyou-page">
        //                         <img style={{ width: '100%', marginBottom: '35px' }} src={this.state.survey.banner_src} alt="logo"/>
        //                         <h1 className="survey-thankyou-title user-generated notranslate">
        //                             {this.state.lang ? 
        //                             <span className="title-text">Time up<br></br>Thanks for your cooperation!</span>
        //                             :
        //                             <span className="title-text">เวลาในการตอบแบบสำรวจได้หมดลงแล้ว<br></br>ขอบคุณสำหรับความร่วมมือ</span>
        //                             }
        //                         </h1>
        //                     </div>
        //                     :
        //                     <article data-page-id="110955719" className="survey-page survey-page-white" style={styles.surveyBackground}>
        //                         <section className="survey-page-body" style={{ paddingTop: '0'}}>
        //                             <div className="question-row clearfix" style={{ marginTop: '100px', marginBottom: '200px' }}>
        //                                 <div className="question-container">
        //                                     <div id="question-field-439413964" className=" question-presentation-image qn question image" data-alt-title="Image" style={{ textAlign: 'center' }}>
        //                                         <img className={this.state.survey.image_src ? "user-generated" : 'hidden'} style={styles.surveyImage} src={this.state.survey.image_src} alt="logo"/>
        //                                         <h1 className="survey-title user-generated notranslate">
        //                                         {this.state.lang ? 
        //                                         <span className="title-text">Time up<br></br>Thanks for your cooperation!</span>
        //                                         :
        //                                         <span className="title-text">เวลาในการตอบแบบสำรวจได้หมดลงแล้ว<br></br>ขอบคุณสำหรับความร่วมมือ</span>
        //                                         }
        //                                         </h1>
        //                                     </div>
        //                                 </div>
        //                             </div>
        //                         </section>
        //                     </article>
        //                     }
        //                 </main>
        //             </div>    
        // }
        else if (this.state.isSuccessLoading) {

            return (
                <div ref={ el => this.container = el} style={containerStyles}> 
                    <main className={ 
                        // iconframework is for testing
                        // (this.props.match.params.xSite === "iconframework" && this.state.surveyId ) ||

                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 8) ||
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 12) ||

                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 13) ||
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 14) ||
                        
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 15) ||
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 16) ||

                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 17) ||
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 18) ||

                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 19) ||
                        (this.props.match.params.xSite === "singha" && this.state.surveyId === 20) ? 
                    
                        "v3theme text_center singha-consent-form" : "v3theme text_center"}>
                        <article data-page-id="110955719" className="survey-page survey-page-white" style={styles.surveyBackground}>
                            <header className="survey-page-header"></header>

                            <div id="overlay" className={ this.state.submitLoading ? '' : 'hidden'}>
                            <img className="img" style={{ width: '20px' }} src={`/cxm/client/loading.gif`} alt="Loading"/> Submitting...
                            </div>

                            { (this.state.survey.enable_src_type === 2 && this.state.survey.banner_src) &&
                            <img style={{ width: '100%', marginBottom: '65px' }} src={this.state.survey.banner_src} alt="logo"/>
                            }
                            
                            { (this.state.survey.enable_src_type === 2 && !this.state.survey.banner_src) &&
                            <div className="question-row clearfix" style={{ marginBottom: '65px' }}></div>
                            }
                            
                            <section className="survey-page-body" style={{ paddingTop: '0'}}>

                                <div className='survey-title-container clearfix survey-title-align-left has-survey-title '>
                                    { (this.state.survey.enable_src_type === 1 && this.state.survey.image_src) &&
                                    <div className="question-row clearfix" style={{ marginBottom: 0 }}>
                                        <div className="question-container">
                                        <div className={ this.state.survey.logo_alignment === 1 ? 'question-presentation-image question logo-align-center' : this.state.survey.logo_alignment === 2 ? 'question-presentation-image question logo-align-right' : 'question-presentation-image question'}>
                                                <img style={styles.surveyImage} src={this.state.survey.image_src} alt="logo"/>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    { (this.state.survey.enable_src_type === 1 && !this.state.survey.image_src) &&
                                    <div className="question-row clearfix" style={{ marginBottom: '65px' }}></div>
                                    }
                                    <div className="survey-title-table-wrapper">
                                        <table role="presentation" className="survey-title-table table-reset">
                                            <tbody>
                                                <tr>
                                                    <td className="survey-title-cell">
                                                        <h1 className="survey-title user-generated notranslate">
                                                            <span className="title-text" style={fontStyles.globalFont}>
                                                                {parse(this.state.surveyName)}
                                                            </span>
                                                        </h1>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {   this.state.headerDescription[this.state.currentPageNo-1] && 
                                    this.state.headerDescription[this.state.currentPageNo-1] !== '<p></p>' && 
                                    this.state.headerDescription[this.state.currentPageNo-1] !== '<p><br></p>' ?
                                    <div style={{ marginTop: '65px', marginBottom: '40px' }}>
                                        <span style={fontStyles.globalFont}>
                                            {parse(this.state.headerDescription[this.state.currentPageNo-1])}
                                        </span>
                                    </div>
                                    : 
                                    <div></div>
                                }

                                <div id="question-info-list" className={ this.state.currentPageNo === 1 && this.state.survey.client_info_form ? "question-row clearfix" : "hidden" } style={{ paddingTop: 30, marginBottom: 0, borderTop: '1px solid #edeeee', borderBottom: '1px solid #edeeee' }}></div>

                                <form name="surveyForm"
                                    action=""
                                    method="post"
                                >
                    
                                    <div className="questions clearfix">
                                        <div id="question-items-list"></div>
                                    </div>

                                    <div className="center-text clearfix" style={{ marginBottom: '50px' }}>

                                        { this.state.currentPageNo > 1 && 
                                        <button type="button" onClick={ (e) => this.onMouseClickPrevHandler(e) } className={ "btn small prev-button survey-page-button notranslate" } style={ styles.previousButton }>
                                            {this.state.lang ? parse(this.state.survey.previous_text_EN) : parse(this.state.survey.previous_text)}
                                        </button>
                                        }

                                        { this.state.currentPageNo < this.state.numPage && 
                                        <button type="button" onClick={ (e) => this.onMouseClickNextHandler(e) } className={ "btn small next-button survey-page-button notranslate" } style={ styles.nextButton }>
                                            {this.state.lang ? parse(this.state.survey.next_text_EN) : parse(this.state.survey.next_text)}
                                        </button>
                                        }
                                        { this.state.currentPageNo === this.state.numPage &&
                                        <button disabled={this.state.submitLoading} type="button" onClick={ (e) => this.onMouseClickSubmitHandler(e) } className={ "btn small done-button survey-page-button notranslate" } style={ styles.doneButton }>
                                            {this.state.lang ? parse(this.state.survey.done_text_EN) :parse(this.state.survey.done_text)}
                                        </button>
                                        }
                                    </div>

                                    <input type="hidden" id="survey_data" name="survey_data" value="4FoTYerhlqpl9" />
                                    <input type="hidden" data-response-quality id="response_quality_data" name="response_quality_data" value="{}" />
                                    <input type="hidden" id="is_previous" name="is_previous" value="false" />
                                    <input type="hidden" id="disable_survey_buttons_on_submit" name="disable_survey_buttons_on_submit" value=""/>
            
                                </form>

                                {   this.state.footerDescription[this.state.currentPageNo-1] && 
                                    this.state.footerDescription[this.state.currentPageNo-1] !== '<p></p>' && 
                                    this.state.footerDescription[this.state.currentPageNo-1] !== '<p><br></p>' ?
                                    <div style={{ marginTop: '65px', marginBottom: '40px', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                                        <span style={fontStyles.globalFont}>
                                            {parse(this.state.footerDescription[this.state.currentPageNo-1])}
                                        </span>
                                    </div>
                                    :
                                    <div></div>
                                }
        
                            </section>
                        </article>
                        <div className="privacy-policy-icon-super-container"></div>
                        {this.state.survey.enable_progressbar ?
                            <div
                                style={{
                                    backgroundColor: this.state.survey.progressbar_background_color,
                                    color: this.state.survey.progressbar_text_color,
                                    width: '100%', 
                                    position: this.state.survey.progressbar_type ? 'unset' : 'fixed', 
                                    bottom: 0, 
                                    left: 0,
                                    display: "flex",
                                    justifyContent: 'center',
                                    padding: '8px'
                                }}
                            >
                                    <div style={{ marginRight: 10 }}>
                                        {`${this.state.sumAnswer} of ${this.state.numQuestion} answered`}</div>
                                    <Progress percent={this.state.sumAnswer ? 100*this.state.sumAnswer/this.state.numQuestion : 0 } style={{ width: '200px'}} showInfo={false}/>
                            </div>
                        : null}
                    </main>           
                </div>
            );
        }
        else{
            return(<div></div>);
        }
    }
}