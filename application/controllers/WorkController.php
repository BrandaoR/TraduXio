<?php

/**
 * Work controller
 *
 * 
 * @uses       Tdxio_Controller_Abstract
 * @package    Traduxio
 * @subpackage Controller
 */ 
 
class WorkController extends Tdxio_Controller_Abstract
{
    protected $_modelname='Work'; 
    public $_privilegeList=array('Read Text','Edit Text','Create Translation','Manage');
    public $MONTHSEC = 1296000; //15 giorni
    
    public function init()
    {
        // Local to this controller only; affects all actions,
        // as loaded in init: 
    }

        /**
         * The index, or landing, action will be concerned with listing the entries 
         * that already exist.
         *
         * Assuming the default route and default router, this action is dispatched 
         * via the following urls:
         * - /work/
         * - /work/index
         *
         * @return void
         */
    public function indexAction()
    {
        $work = $this->_getModel();
        $entries = $work->fetchAllOriginalWorks();
        //Tdxio_Log::info($entries);
                
        $newModWorks = array();
        $sort=array();

        if(!is_null($entries)){
            foreach ($entries as $entry) {
                
                if(!is_null($NMentry=$this->newModified($entry,'orig'))){$newModWorks[]=$NMentry;}
                
                if (isset($entry['language'])) {
                    $lang=__($entry['language']);
                    if (!isset($sort[$lang])) {
                        $sort[$lang]=array();
                    }
                    if (!isset($entry['author']) || $entry['author']==='' ) {
                        $entry['author']=__('Anonymous');
                    }
                    $author=__($entry['author']);
                    if(!isset($sort[$lang][$author])) {
                        $sort[$lang][$author]=array();
                    }
                    $sort[$lang][$author][]=$entry;
                }
            }
        }
        
        $news = $this->sortByAge(array_merge($this->getNews(),$newModWorks));
        Tdxio_Log::info($news,'newentries');
        if(!empty($sort)){ksort($sort,SORT_STRING);}     
        
        $this->view->entries=$sort;        
        $this->view->home = true;
        $this->view->news = $news;
    }
        
        
    public function depositAction()
    {       
        $form = new Form_TextDeposit();

        if ($this->getRequest()->isPost()) {
            
            if ($form->isValid($this->getRequest()->getPost())) {
                
                $data = $form->getValues();
                $data['creator']=Tdxio_Auth::getUserName();
                $model = $this->_getModel();
                $model->save($data);
                Tdxio_Log::info($data);
                return $this->_helper->redirector('index');
            }
        }
        $this->view->form = $form;
    } 
    
    public function readAction(){
    
        $request = $this->getRequest();
        $id = $request->getParam('id');
        $model = $this->_getModel();
        $tagForm = new Form_Tag();
        
        if (!$id || !($work=$model->fetchOriginalWork($id))) {
            throw new Zend_Controller_Action_Exception(sprintf('Work Id "%d" does not exist.', $id), 404);
        }   
        if(empty($work['Sentences'])){
            return $this->_helper->redirector->gotoSimple('read','translation',null,array('id'=>$id));
        }
        Tdxio_Log::info($work,'work read');
        if ($this->getRequest()->isPost()) {            
            if ($tagForm->isValid($this->getRequest()->getPost())) {                
                $data = $tagForm->getValues();                     
                return $this->_helper->redirector->gotoSimple('tag','tag',null,array('id'=>$id,'genre'=>$data['tag_genre'],'tag'=>$data['tag_comment']));  
            }
        }
        $this->view->canTag = $model->isAllowed('tag',$id);
        $this->view->canManage = $model->isAllowed('manage',$id);
        $this->view->work = $work;
        $this->view->tagForm = $tagForm;
    }
    
    public function translateAction(){
        $request = $this->getRequest();
        $id = $request->getParam('id');
        $model = $this->_getModel();     
        if (!$id || !$origWork=$model->fetchOriginalWork($id)) {
            throw new Zend_Controller_Action_Exception(sprintf('Work Id "%d" does not exist.', $id), 404);
        }
        $form = new Form_Translate();
        
        if ($request->isPost()) {
            if ($form->isValid($request->getPost())) {
                $data=$form->getValues();
                $userid = Tdxio_Auth::getUserName();                
                $data['creator']=$userid;
                $newId=$model->createTranslation($data,$id);
                return $this->_helper->redirector->gotoSimple('edit','translation',null,array('id'=>$newId));
            }
        }
        $this->view->form=$form;
        $this->view->origWork=$origWork;
    }
        
    public function myAction(){
        $user = Tdxio_Auth::getUserName(); 
        if(!is_null($user)){
            $work = $this->_getModel();
            $myTranslations = $work->fetchMyTranslationWorks($user);
            $srcLangs=array();
            foreach($myTranslations as $trWork){
                $srcLangs[$trWork['srcLang']][$trWork['language']][]=$trWork;
            }
            $this->view->myEntries = $srcLangs;
            
            Tdxio_Log::info($srcLangs,'my translations');       
        }else return $this->_helper->redirector->gotoSimple('index','work');
    }
    
    public function extendAction(){
        $request = $this->getRequest();
        $id=$request->getParam('id');
        
        $model=$this->_getModel(); 
        
        if (!$id || !($work=$model->fetchWork($id))) {
            throw new Zend_Controller_Action_Exception(sprintf('Work Id "%d" does not exist.', $id), 404);
        }   
        
        if(!$model->isOriginalWork($id)) {
            throw new Zend_Controller_Action_Exception(sprintf('Cannot extend a translation. Edit it instead.'), 404);
        }
        
        $sentenceModel = new Model_Sentence();
        
        if($id && $work=$model->fetchOriginalWork($id))
        {           
            $form = new Form_TextExtend(); 
            $lastsentence = $sentenceModel->fetchSentence($id,$sentenceModel->getLastSentenceNumber($id));
            Tdxio_Log::info($lastsentence,'pipipopo');
            $lasttext = ' '.$lastsentence[0]['content'];
            
            if ($this->getRequest()->isPost()) 
            {
                if ($form->isValid($request->getPost())){
                    $model = $this->_getModel();
                    $data=$form->getValues();
                                    
                    unset($data['submit']);
                    
                    $newId=$model->update($data,$id);
                    return $this->_helper->redirector->gotoSimple('read',null,null, array('id'=>$id));
                }
            }
            $this->view->form=$form;
            $this->view->text=$work;
            $this->view->lasttext=$lasttext;
            
        }else {
            throw new Zend_Exception("Couldn't find text $id");
        }
    }   

    public function manageAction(){
                
        $request = $this->getRequest();
        $id= $request->getParam('id');
        $model=$this->_getModel();
        $visibility=$model->getAttribute($id,'visibility');
        if($visibility=='custom'){
            $addform = new Form_AddPrivilege($this->_privilegeList);            
            $privilegeList=$model->getWorkPrivileges($id);          
            $this->view->addform=$addform;              
            if(!is_null($privilegeList)){
                $remform = new Form_RemovePrivilege($id,$privilegeList);
                $this->view->remform=$remform;
                if($this->getRequest()->isPost()) {
                    Tdxio_Log::info('ispost rem');
                    if($remform->isValid($request->getPost())) {
                        Tdxio_Log::info('isvalid rem');
                        $data=$remform->getValues();
                        if($data['submit']=="Remove Privilege"){
                            $remove_list=array_keys($data,1);
                            if(!empty($remove_list)){                               
                                $model->removePrivilege($remove_list,array());                              
                                return $this->_helper->redirector->gotoSimple('manage',null,null, array('id'=>$id));
                            }
                        }
                        Tdxio_Log::info($data);
                    }
                    $this->view->remform=$remform;
                }
            }
            if($this->getRequest()->isPost()) {
                Tdxio_Log::info('ispost add');
                if($addform->isValid($request->getPost())) {
                    Tdxio_Log::info('isvalid add');
                    $data=$addform->getValues();
                    if($data['submit']=="Add Privilege"){
                        Tdxio_Log::info($data);
                        unset($data['submit']);
                        $data['work_id']=$id;
                        $data['visibility']='custom';
                        $model->addPrivilege($data);
                        return $this->_helper->redirector->gotoSimple('manage',null,null, array('id'=>$id));
                    }
                }
            }
            $this->view->link='Switch to Standard Privileges';
        }else{
            $stdform = new Form_StdPrivilege();
            $this->view->stdform=$stdform;
            if($this->getRequest()->isPost()) {
                Tdxio_Log::info('ispost std');
                if($stdform->isValid($request->getPost())) {
                    Tdxio_Log::info('isvalid std');
                    $data=$stdform->getValues();
                    if($data['submit']=="Save"){                        
                        unset($data['submit']);
                        Tdxio_Log::info($data,"manage data");
                        $model->update($data,$id);
                        return $this->_helper->redirector->gotoSimple('read',null,null, array('id'=>$id));
                    }               
                }
            }
            $this->view->stdform->setDefaults(array('visibility'=>$visibility));
            $this->view->link='Switch to Custom Privileges';
        }           
        $this->view->visibility=$visibility;
        $this->view->work_id=$id;       
    }
    
    public function switchAction(){
        $model=$this->_getModel();
        $request = $this->getRequest();
        $id=$request->getParam('id');
        $visibility=$model->getAttribute($id,'visibility');
    
        if($visibility=='public' or $visibility=='private'){
            // change field visibility in table text to custom
            // go to manage page
            $data=array('visibility'=>'custom');
            $model->update($data,$id);
        }elseif($visibility=='custom'){
            //delete all custom privileges for the text  $id
            // change field visibility in table text to private
            // go to manage page
            $attr_value=array('work_id'=>$id);
            $model->removePrivilege(array(),$attr_value); 
            $data=array('visibility'=>'private');
            $model->update($data,$id);
        }
        return $this->_helper->redirector->gotoSimple('manage',null,null, array('id'=>$id));
    }

    protected function tagSentence()
    {
        
    } 
    
    public function newModified($item,$type){
        $NMitem=null;
        if(isset($item['created'])){
            $item['type']=$type;
            if(((!isset($item['modified']))or($item['modified']-$item['created']<10))and(time() - strtotime($item['created']) < $this->MONTHSEC))
            {
                $NMitem=$item;
                $NMitem['age']=time() - strtotime($item['created']);
                $NMitem['NM']='New';
            }elseif(($item['created'] < $item['modified']) and (time() - strtotime($item['modified']) < $this->MONTHSEC))
            {
                $NMitem=$item;
                $NMitem['age']=time() - strtotime($item['modified']);
                $NMitem['NM']='Mod';
            }            
        }           
        return $NMitem;
    }
    
    public function getNews(){
        // get visible texts inserted or modified in the last 30 days
        $model = $this->_getModel();
        $transl = $model->getNewModTransl();
        $news = array();
        
        foreach($transl as $key=> $item){
            if(!is_null($NMitem=$this->newModified($item,'tra'))){$news[]=$NMitem;}
        }
        
        // get tags inserted on own texts in the last 30 days
        $taggModel = new Model_Taggable();
        $tags = $taggModel->getNewModTags(Tdxio_Auth::getUserName());   
               
        foreach($tags as $key=> $item){
            if(!is_null($NMitem=$this->newModified($item,'tag'))){$news[]=$NMitem;}
        }   
        return $news;
    }
    
    public function sortByAge($list){
        
        $sortedList=array();
        foreach($list as $key=>$item){
            $sortedList[$item['age']][]=$item;    
        }
        
        if(!empty($sortedList)){ksort($sortedList);}
        return($sortedList);
    }
    
    public function getRule($request){
        $action = $request->action;
        $resource_id = $request->getParam('id');
        
        $rule = 'noAction';
        Tdxio_Log::info($request,'request');
        Tdxio_Log::info($resource_id,'resource_id');
        
        if(!is_null($resource_id)){ 
            if(!($this->_getModel()->entryExists(array('id'=>$resource_id))))
            {throw new Zend_Exception(sprintf('Work Id "%d" does not exist.',$resource_id), 404);}
            $visibility=$this->_getModel()->getAttribute($resource_id,'visibility');
            Tdxio_Log::info($visibility,'visibilita');
        }
        
        switch($action){
            case 'index': 
                        $rule = array('privilege'=> 'read','work_id' => null);      
                        break; 
            case 'deposit': 
                        if($request->isPost()){
                            $rule = array('privilege'=> 'create','work_id' => null );       
                        }else{$rule = array('privilege'=> 'create','work_id' => null, 'notAllowed'=>true);} 
                        break; 
            case 'translate':
                if($request->isPost()){
                    $rule = array('privilege'=> 'translate','work_id' => $resource_id);
                }else{
                    $rule = array('privilege'=> 'read','work_id' => $resource_id, 'notAllowed'=>true);
                }break;
            case 'read':
                if($request->isPost()){
                    $rule = array('privilege'=> 'tag','work_id' => $resource_id);
                }else{
                        $rule = array('privilege'=> 'read','work_id' => $resource_id,'visibility'=>$visibility,'edit_privilege'=> 'edit');      
                }break;                      
//          case 'edit':
//                  if($request->isPost()){
//                      $rule = array('privilege'=> 'edit','work_id' => $resource_id,'visibility'=>$visibility);        
//                  }else{$rule = array('privilege'=> 'edit','work_id' => $resource_id,'notAllowed'=>true,'visibility'=>$visibility);       
//                  } break; 
            case 'my': break;                   
            case 'extend':
                    if($request->isPost()){
                        $rule = array('privilege'=> 'edit','work_id' => $resource_id,'visibility'=>$visibility);        
                    }else{
                        $rule = array('privilege'=> 'edit','work_id' => $resource_id,'visibility'=>$visibility, 'notAllowed'=>true);    
                    } break;
            case 'switch':  
            case 'manage':
                if($request->isPost()){
                        $rule = array('privilege'=> 'manage','work_id' => $resource_id,'visibility'=>$visibility);      
                    }else{
                        $rule = array('privilege'=> 'manage','work_id' => $resource_id, 'visibility'=>$visibility, 'notAllowed'=>true); 
                    } break;            
            default:$rule = 'noAction';
        }               
        return $rule;
        
    }
    
    
}
