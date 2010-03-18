<?php 

/*** Login controller
 *
 * 
 * @uses       Tdxio_Controller_Abstract
 * @package    Traduxio
 * @subpackage Controller
 */
 
class LoginController extends Tdxio_Controller_Abstract
{
    
    
    public function preDispatch()
    {        
        if (Zend_Auth::getInstance()->hasIdentity()) {
            // If the user is logged in, we don't want to show the login form;
            // however, the logout action should still be available
            if ('logout' != $this->getRequest()->getActionName()) {
            
            $this->_redirect($_SERVER['HTTP_REFERER']);
            }
        } else {
            // If they aren't, they can't logout, so that action should
            // redirect to the login form
            if ('logout' == $this->getRequest()->getActionName()) {
                $this->_helper->redirector('index');
            }
        }
    }
    
    public function indexAction()
    {
        Tdxio_Log::info('set URI','indexAction');
        $form = $this->getForm();
        $request = $this->getRequest();
        if ($request->isPost()) {
            if ($form->isValid($request->getPost())) {
                $values=$form->getValues();
                // Get our authentication adapter and check credentials
                $adapter = $this->getAuthAdapter($values);
                $auth    = Zend_Auth::getInstance();
                $result  = $auth->authenticate($adapter);
                // $this->log($result);
                if ($result->isValid()) {
                    $user = Tdxio_Auth::getUserName();
                    $model = new Model_User();          
                    $model->registerUser($user);
                        
                    // We're authenticated! Redirect to the original page
                    $this->_redirect($values['redirect']);
                } else {
                        // Invalid credentials
                    $form->setDescription('Invalid credentials provided');
                }
            }
        } else {
            $form->getElement('redirect')->setValue($_SERVER['HTTP_REFERER']);
        }
        $this->view->form = $form;
    }
    
    
    public function processAction()
    {

        // Check if we have a POST request
        if (!$request->isPost()) {
            return $this->_helper->redirector('index');
        }

        // Get our form and validate it
    }
    
    public function logoutAction()
    {
        Zend_Auth::getInstance()->clearIdentity();
        $this->_helper->redirector('index','index'); // back to login page
    }
    
    public function getForm()
    {
        $form=new Form_Login(array(
            'method' => 'post'
        ));
        return $form;
    }
    
     public function getAuthAdapter(array $params)
    {
        $options=array(array(
            'host'=>'ldap.hypertopic.org'
            //'accountDomainName'=>'',
        ));
        //$this->log($params);
        return new Zend_Auth_Adapter_Ldap($options, "cn=".$params['username'].",dc=hypertopic,dc=org",
                                      $params['password']);        // Leaving this to the developer...
        // Makes the assumption that the constructor takes an array of
        // parameters which it then uses as credentials to verify identity.
        // Our form, of course, will just pass the parameters 'username'
        // and 'password'.
    }    
}
