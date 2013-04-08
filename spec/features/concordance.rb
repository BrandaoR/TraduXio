require 'spec_helper'

feature 'Do a concordance' do

  $a_title = a_string()

  background do
    visit '/work/index'
    click_on 'D�poser un nouveau texte' 
    fill_in 'Titre', :with => $a_title
    fill_in 'Auteur', :with => 'TestAuteur'
    fill_in 'Contenu du Texte', :with => 'Bla bla bla bla test'
    select 'Langue Original', :from => 'Fran�ais'    
    click_on 'D�poser'
	click_on 'Cr�er une traduction'
	fill_in '*Translator', :with => 'TestTraducteur'
	fill_in '*Titre', :with => $a_title + ' (traduction)'
	select '*Translate to', :from => 'Anglais'
	click_on 'D�poser'
	fill_in 'Bloc 1', :with => 'Bla bla bla bla apple'
	visit '/login/logout'
  end

  scenario 'View an extract of a private traduction in a concordance' do
  visit '/translation/concord'
    fill_in 'Recherche', :with => 'bla bla apple'
    click_on 'Recherche'
    page.should have_content $a_title + ' (traduction)'
    page.should have_content 'Bla bla bla bla apple'
    page.should have_content 'Bla bla bla bla test'
    page.should have_content 'TestAuteur'
  end

end
