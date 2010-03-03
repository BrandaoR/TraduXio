<?php

/**
 * Work model
 *
 * Represents a single work entry.
 * 
 * @uses       Model_Taggable
 * @package    Traduxio
 * @subpackage Model
 */
class Model_Work extends Model_Taggable
{
	protected $_tableClass = 'Work';
    protected $_cutter;
    
	/**
     * Save a new entry
     *
     * @param  array $data
     * @return int|string
     */
	 
	public function save(array $data)
	{
		// insert data into the table "work"
		$table  = $this->_getTable();
		$new_id = $table->insert($data);
        
		// insert data into the table "sentence"
		$sentences = $this->_getCutter()->getSentences($data['the_text']);
		unset($data['the_text']);

		$sentenceModel = new Model_Sentence();
		$sentenceModel->bulkSave($new_id,$sentences,true);
		return $new_id;
	}
	
	public function update(array $data, $id)
	{
		if (isset($data['insert_text']))  {
            $sentences = $this->_getCutter()->getSentences($data['insert_text']);
            
			$sentenceModel=new Model_Sentence();
			
			$offset=($sentenceModel->getLastSentenceNumber($id))+1;            
			$sentences_offset=array();
			foreach ($sentences as $i=>$seg) {
				$sentences_offset[$i+$offset]=$seg;
			}
			$sentenceModel->bulkSave($id,$sentences_offset,false);
			$segnums=array_keys($sentences_offset);
			$fromseg=$segnums[0];
			$toseg=end($segnums);
			Tdxio_Log::info($sentences_offset,'sentences aggiornate nella chiamata diretta');
			Tdxio_Log::info('fromseg is '.$fromseg.', toseg is '.$toseg);
			
			$table=$this->_getTable();
			Tdxio_Log::info($data);
			$new_id=$table->update($data,$table->getAdapter()->quoteInto('id = ?',$id));
			
			//aggiungi un translation block ad ogni traduzione di $id
			$this->addInterpretations($id,$fromseg,$toseg,$data['insert_text']);
			
        }
        return $new_id;	
	}
		
	public function createTranslation(array $data,$original_work_id)
	{
		// insert data into the table "work"
		$table  = $this->_getTable();
		$work_id = $table->insert($data);
        
		// insert data into the table "interpretation"
		$translationModel = new Model_Translation();
		$translationModel->create($work_id, $original_work_id);
		return $work_id;
	}

	protected function _getCutter() {
		if (null === $this->_cutter) {
			$this->_cutter = new Tdxio_Cutter();
		}
		return $this->_cutter;
	}

	
	public function fetchWork($id){
		return $this->fetchEntry($id);
	}
	
	public function fetchOriginalWork($work_id){
	
		if(!$work = $this->fetchWork($work_id)){return null;}
		$sentenceModel= new Model_Sentence();
		$work['Sentences'] = $sentenceModel->fetchSentences($work_id);
		$content = '';
		foreach($work['Sentences'] as $key => $sentence){
			$content.=$sentence['content'];
		}
		$work['the_text']=$content;
		$translationModel = new Model_Translation();
		$work['Interpretations'] = $translationModel->fetchSentencesInterpretations($work_id);	
		return $work;
	}

	public function fetchAllOriginalWorks()
	{
		$table = $this->_getTable();
		$select1 = $this->getSelectCondOriginalWork('sentence');
		$select2 = $table->select()->where('id IN (?)',$select1);
		Tdxio_Log::info('stringa sql '.$select2->__toString());
		return $table->fetchAll($select2);
	}
	
	public function getSelectCondOriginalWork($table_name){
		$table = $this->_getTable();
		$db = $table->getAdapter();
		$select = $db->select()->distinct()->from($table_name,'work_id');
		
		return $select;		
	}
	
	public function fetchMyTranslations($user){
		$table = $this->_getTable();
		$select1 = $this->getSelectCondOriginalWork('interpretation');
		$select2 = $table->select()->where('id IN (?)',$select1)->where('creator = ?',$user);
		return	$table->fetchAll($select2);
	}
	
	public function isOriginalWork($id)
	{
		$table = $this->_getTable();
		$db = $table->getAdapter();
		
		$select = $db->select()->from('sentence')->where('work_id = ?', $id);
		$result = $db->fetchAll($select);
		if(!empty($result))
			return true;
		else 
			return false;		
	
	}
	
	public function tag($tag){
		
		$tagTable = new Model_DbTable_Tag;
		$data = array('taggable' => $tag['work_id'],
					  'user' => $tag['username'],
				      //'genre' => $tag['comment'],
					  'comment' => $tag['comment']
					);
		$newId = $tagTable->insert($data);
		
	}
	
	protected function addInterpretations($work_id,$fromseg,$toseg,$srcText){
		
		$table  = $this->_getTable();
		$intTable = new Model_DbTable_Interpretation();
		
		$select = $intTable->select()->distinct()->from($intTable,'work_id')->where('original_work_id = ?',$work_id); 
		$trnsltIds = $intTable->fetchAll($select);
		$trnsltIds = $trnsltIds->toArray();
		$trModel = new Model_Translation();
			
		Tdxio_Log::info($trnsltIds,'trnsltIds');
		
		foreach($trnsltIds as $key=>$transl){
			Tdxio_Log::info($transl,'Guarda');				
			$my_id = $transl['work_id'];
			$data['TranslationBlocks']=array();
			$data['TranslationBlocks'][]=array('original_work_id' => $work_id,
											'work_id'=> $my_id,
											'from_segment'=>$fromseg,
											'to_segment'=>$toseg,
											'translation'=>"");
			Tdxio_Log::info($data,'data');
			$trModel->update($data,$my_id);
			Tdxio_Log::info('Adding translation block in text with id '.$my_id);
							
		}
	}



}
