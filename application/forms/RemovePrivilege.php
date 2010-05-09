<?php 
// application/forms/RemovePrivilege.php 
/***
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 **/

/**
 * This is the text edit form.  It is in its own directory in the application
 * structure because it represents a "composite asset" in your application.  By
 * "composite", it is meant that the form encompasses several aspects of the
 * application: it handles part of the display logic (view), it also handles
 * validation and filtering (controller and model).
 */

class Form_RemovePrivilege extends Form_Abstract
{

    public $_id=null;
    public $_list=null;
    
    function __construct($id,$list) {
        $this->_id=$id;
        $this->_list=$list;
        parent::__construct();
    }
    /**
     * init() is the initialization routine called when Zend_Form objects are
     * created. In most cases, it make alot of sense to put definitions in this
     * method, as you can see below.  This is not required, but suggested.
     * There might exist other application scenarios where one might want to
     * configure their form objects in a different way, those are best
     * described in the manual:
     *
     * @see    http://framework.zend.com/manual/en/zend.form.html
     * @return void
     */
    public function init()
    {
        // set the method for the display form to POST
        $this->setMethod('post');
        $this->setAttrib('class','privilege-form');
        $this->setAttrib('id','remform');

        
        foreach($this->_list as $key=>$privilege){
        if(is_null($privilege['work_id'])){
            $attrList=array(
                'label' => $privilege['plaintext'],
                'value' => $privilege['id'],
                'required' => true,
                'disabled'=>'disabled',
                'display' => 'inline'
            );
        }
        else{
            $attrList=array(
                'label' => $privilege['plaintext'],
                'value' => $privilege['id'],
                'required' => true,
                'enabled'=> 'enabled',
                'display' => 'inline'
            );
        
        }
            $this->addElement('checkbox', preg_quote($privilege['id']),$attrList);

        }
        // add the submit button
        $this->addElement('submit', 'submit', array(
            'label'    => __('Remove Privilege'),
            'id' => 'remsubmit'
        ));

    }

    protected function _getUsers()
    {
        require_once APPLICATION_PATH . '/models/UserModel.php';
        $userModel = new UserModel();
        $usersarray=$userModel->fetchEntries();
        $users[0]='all users';
        foreach($usersarray as $key=>$user){
            $users[$key+1]=$user['id'];
        }
        
        return $users;
    }
    
    protected function _getTranslations()
    {
        require_once APPLICATION_PATH . '/models/TextModel.php';
        $txtModel = new TextModel();
        $text=$txtModel->fetchEntry($this->_id);
        $tempkey=0;
        if(isset($text['Translations'])){
            foreach ($text['Translations'] as $key=>$translation){
                $translations[$key]=$translation['title'].' ('.$translation['language'].')';
                $tempkey=$key;
            }
            if($tempkey>0){$translations[$tempkey+1]='all translations';}
        }               
        return $translations;
    }

}

